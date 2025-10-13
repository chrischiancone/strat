#!/usr/bin/env tsx

/**
 * Security audit script for the Stratic Plan application
 * Scans for common security vulnerabilities and misconfigurations
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname, relative } from 'path'
import { logger } from '../lib/logger'

interface SecurityIssue {
  type: 'high' | 'medium' | 'low' | 'info'
  category: string
  file: string
  line?: number
  message: string
  description?: string
  recommendation?: string
}

class SecurityAuditor {
  private issues: SecurityIssue[] = []
  private rootDir: string

  constructor(rootDir: string) {
    this.rootDir = rootDir
  }

  // Add security issue
  private addIssue(issue: Omit<SecurityIssue, 'file'> & { file?: string }, currentFile?: string): void {
    this.issues.push({
      ...issue,
      file: issue.file || currentFile || 'unknown',
    })
  }

  // Recursively scan directory for files
  private scanDirectory(dir: string): string[] {
    const files: string[] = []
    const items = readdirSync(dir)

    for (const item of items) {
      const fullPath = join(dir, item)
      const stats = statSync(fullPath)

      if (stats.isDirectory()) {
        // Skip common directories that don't need scanning
        if (['node_modules', '.git', '.next', 'dist', 'build', 'coverage'].includes(item)) {
          continue
        }
        files.push(...this.scanDirectory(fullPath))
      } else {
        files.push(fullPath)
      }
    }

    return files
  }

  // Scan for hardcoded secrets
  private scanForSecrets(content: string, filePath: string): void {
    const secretPatterns = [
      {
        pattern: /(?:password|pwd|pass)\s*[:=]\s*["']([^"']{4,})["']/gi,
        name: 'Hardcoded Password',
        severity: 'high' as const,
      },
      {
        pattern: /(?:api[_-]?key|apikey)\s*[:=]\s*["']([a-zA-Z0-9]{16,})["']/gi,
        name: 'Hardcoded API Key',
        severity: 'high' as const,
      },
      {
        pattern: /(?:secret[_-]?key|secretkey)\s*[:=]\s*["']([a-zA-Z0-9]{16,})["']/gi,
        name: 'Hardcoded Secret Key',
        severity: 'high' as const,
      },
      {
        pattern: /(?:database[_-]?url|db[_-]?url)\s*[:=]\s*["']([^"']+)["']/gi,
        name: 'Hardcoded Database URL',
        severity: 'high' as const,
      },
      {
        pattern: /(?:jwt[_-]?secret|jwtsecret)\s*[:=]\s*["']([^"']{8,})["']/gi,
        name: 'Hardcoded JWT Secret',
        severity: 'high' as const,
      },
      {
        pattern: /sk-[a-zA-Z0-9]{40,}/g,
        name: 'OpenAI API Key',
        severity: 'high' as const,
      },
      {
        pattern: /AIza[0-9A-Za-z\\-_]{35}/g,
        name: 'Google API Key',
        severity: 'high' as const,
      },
    ]

    const lines = content.split('\n')
    
    for (const { pattern, name, severity } of secretPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        const line = lines[lineNumber - 1]?.trim()

        // Skip if it's clearly a placeholder or example
        if (line?.includes('example') || line?.includes('placeholder') || 
            line?.includes('TODO') || line?.includes('FIXME') ||
            match[1]?.includes('xxx') || match[1]?.includes('***')) {
          continue
        }

        this.addIssue({
          type: severity,
          category: 'Secrets Management',
          line: lineNumber,
          message: `${name} found in code`,
          description: `Found: ${match[0]}`,
          recommendation: 'Use environment variables or secure secret management instead',
        }, filePath)
      }
    }
  }

  // Scan for SQL injection vulnerabilities
  private scanForSQLInjection(content: string, filePath: string): void {
    const sqlPatterns = [
      {
        pattern: /(?:query|execute)\s*\(\s*["'`].*?\$\{[^}]*\}.*?["'`]/gi,
        message: 'Potential SQL injection via template literals',
      },
      {
        pattern: /(?:query|execute)\s*\(\s*["'`].*?\+\s*[^"'`]+.*?["'`]/gi,
        message: 'Potential SQL injection via string concatenation',
      },
      {
        pattern: /SELECT\s+.*FROM\s+.*WHERE\s+.*\$\{[^}]*\}/gi,
        message: 'Direct variable interpolation in SQL query',
      },
    ]

    const lines = content.split('\n')

    for (const { pattern, message } of sqlPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        this.addIssue({
          type: 'high',
          category: 'SQL Injection',
          line: lineNumber,
          message,
          description: `Found: ${match[0].substring(0, 100)}...`,
          recommendation: 'Use parameterized queries or ORM methods instead',
        }, filePath)
      }
    }
  }

  // Scan for XSS vulnerabilities
  private scanForXSS(content: string, filePath: string): void {
    const xssPatterns = [
      {
        pattern: /dangerouslySetInnerHTML\s*:\s*\{\s*__html\s*:\s*[^}]*\}/gi,
        message: 'Use of dangerouslySetInnerHTML without sanitization',
        severity: 'high' as const,
      },
      {
        pattern: /innerHTML\s*=\s*[^;\n]*(?:\$\{[^}]*\}|[a-zA-Z_$][a-zA-Z0-9_$]*)/gi,
        message: 'Direct innerHTML assignment with variables',
        severity: 'medium' as const,
      },
      {
        pattern: /document\.write\s*\([^)]*(?:\$\{[^}]*\}|[a-zA-Z_$][a-zA-Z0-9_$]*)/gi,
        message: 'Use of document.write with variables',
        severity: 'high' as const,
      },
    ]

    const lines = content.split('\n')

    for (const { pattern, message, severity } of xssPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        this.addIssue({
          type: severity,
          category: 'Cross-Site Scripting',
          line: lineNumber,
          message,
          description: `Found: ${match[0].substring(0, 100)}...`,
          recommendation: 'Sanitize user input before rendering or use safe alternatives',
        }, filePath)
      }
    }
  }

  // Scan for insecure HTTP usage
  private scanForInsecureHTTP(content: string, filePath: string): void {
    const httpPatterns = [
      {
        pattern: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0)/gi,
        message: 'Insecure HTTP URL found',
        severity: 'medium' as const,
      },
      {
        pattern: /fetch\s*\(\s*["']http:\/\/[^"']+["']/gi,
        message: 'HTTP fetch request (should use HTTPS)',
        severity: 'medium' as const,
      },
    ]

    const lines = content.split('\n')

    for (const { pattern, message, severity } of httpPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        this.addIssue({
          type: severity,
          category: 'Insecure Communication',
          line: lineNumber,
          message,
          description: `Found: ${match[0]}`,
          recommendation: 'Use HTTPS URLs instead of HTTP',
        }, filePath)
      }
    }
  }

  // Scan for debug/development code
  private scanForDebugCode(content: string, filePath: string): void {
    const debugPatterns = [
      {
        pattern: /console\.(log|debug|info|warn|error)\s*\([^)]*(?:password|secret|token|key)[^)]*\)/gi,
        message: 'Console log with potential sensitive data',
        severity: 'medium' as const,
      },
      {
        pattern: /debugger\s*;/gi,
        message: 'Debugger statement found',
        severity: 'low' as const,
      },
      {
        pattern: /alert\s*\(/gi,
        message: 'Alert statement found (development code)',
        severity: 'low' as const,
      },
    ]

    const lines = content.split('\n')

    for (const { pattern, message, severity } of debugPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        this.addIssue({
          type: severity,
          category: 'Debug Code',
          line: lineNumber,
          message,
          description: `Found: ${match[0]}`,
          recommendation: 'Remove debug code before production deployment',
        }, filePath)
      }
    }
  }

  // Scan for unsafe eval usage
  private scanForUnsafeEval(content: string, filePath: string): void {
    const evalPatterns = [
      {
        pattern: /(?:^|[^a-zA-Z0-9_$])eval\s*\(/gi,
        message: 'Use of eval() function',
        severity: 'high' as const,
      },
      {
        pattern: /Function\s*\(\s*["'][^"']*["']\s*,\s*[^)]*\)/gi,
        message: 'Dynamic function creation',
        severity: 'high' as const,
      },
      {
        pattern: /setTimeout\s*\(\s*["'][^"']*["']/gi,
        message: 'setTimeout with string parameter',
        severity: 'medium' as const,
      },
      {
        pattern: /setInterval\s*\(\s*["'][^"']*["']/gi,
        message: 'setInterval with string parameter',
        severity: 'medium' as const,
      },
    ]

    const lines = content.split('\n')

    for (const { pattern, message, severity } of evalPatterns) {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length
        
        this.addIssue({
          type: severity,
          category: 'Code Injection',
          line: lineNumber,
          message,
          description: `Found: ${match[0]}`,
          recommendation: 'Avoid dynamic code execution; use safer alternatives',
        }, filePath)
      }
    }
  }

  // Scan individual file
  private scanFile(filePath: string): void {
    const ext = extname(filePath).toLowerCase()
    
    // Only scan certain file types
    if (!['.ts', '.tsx', '.js', '.jsx', '.json', '.env', '.md'].includes(ext)) {
      return
    }

    try {
      const content = readFileSync(filePath, 'utf-8')
      const relativePath = relative(this.rootDir, filePath)

      // Skip files that are too large (>1MB)
      if (content.length > 1024 * 1024) {
        return
      }

      // Run all scans
      this.scanForSecrets(content, relativePath)
      this.scanForSQLInjection(content, relativePath)
      this.scanForXSS(content, relativePath)
      this.scanForInsecureHTTP(content, relativePath)
      this.scanForDebugCode(content, relativePath)
      this.scanForUnsafeEval(content, relativePath)

      // Additional checks for specific file types
      if (ext === '.env') {
        this.checkEnvFile(content, relativePath)
      }

      if (ext === '.json') {
        this.checkPackageJson(content, relativePath)
      }

    } catch (error) {
      this.addIssue({
        type: 'low',
        category: 'File Access',
        message: `Could not read file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }, filePath)
    }
  }

  // Check .env file security
  private checkEnvFile(content: string, filePath: string): void {
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      if (line.trim() && !line.trim().startsWith('#')) {
        // Check for weak passwords
        if (/password|pwd|pass/i.test(line) && /=.{1,8}$/i.test(line)) {
          this.addIssue({
            type: 'medium',
            category: 'Weak Credentials',
            line: index + 1,
            message: 'Potentially weak password in environment file',
            recommendation: 'Use strong passwords (8+ characters, mixed case, numbers, symbols)',
          }, filePath)
        }

        // Check for localhost URLs in production env files
        if (filePath.includes('prod') && /localhost|127\.0\.0\.1/i.test(line)) {
          this.addIssue({
            type: 'high',
            category: 'Configuration',
            line: index + 1,
            message: 'Localhost URL in production environment file',
            recommendation: 'Use production URLs in production environment files',
          }, filePath)
        }
      }
    })
  }

  // Check package.json for security issues
  private checkPackageJson(content: string, filePath: string): void {
    try {
      const packageData = JSON.parse(content)

      // Check for dev dependencies in production
      if (packageData.dependencies) {
        const suspiciousDeps = ['nodemon', 'webpack-dev-server', 'jest', 'cypress']
        suspiciousDeps.forEach(dep => {
          if (packageData.dependencies[dep]) {
            this.addIssue({
              type: 'low',
              category: 'Dependencies',
              message: `Development dependency "${dep}" in production dependencies`,
              recommendation: 'Move to devDependencies if only needed for development',
            }, filePath)
          }
        })
      }

      // Check for scripts with sudo/elevated permissions
      if (packageData.scripts) {
        Object.entries(packageData.scripts).forEach(([scriptName, script]) => {
          if (typeof script === 'string' && /sudo|su\s/.test(script)) {
            this.addIssue({
              type: 'medium',
              category: 'Privilege Escalation',
              message: `Script "${scriptName}" uses elevated permissions`,
              description: `Script: ${script}`,
              recommendation: 'Avoid scripts that require elevated permissions',
            }, filePath)
          }
        })
      }

    } catch (error) {
      this.addIssue({
        type: 'low',
        category: 'File Format',
        message: 'Invalid JSON format',
      }, filePath)
    }
  }

  // Run comprehensive security audit
  public async audit(): Promise<SecurityIssue[]> {
    console.log('🔍 Starting security audit...\n')
    
    const files = this.scanDirectory(this.rootDir)
    console.log(`📁 Scanning ${files.length} files...\n`)

    for (const file of files) {
      this.scanFile(file)
    }

    // Generate summary
    const summary = this.generateSummary()
    console.log(summary)

    return this.issues
  }

  // Generate audit summary
  private generateSummary(): string {
    const counts = {
      high: this.issues.filter(i => i.type === 'high').length,
      medium: this.issues.filter(i => i.type === 'medium').length,
      low: this.issues.filter(i => i.type === 'low').length,
      info: this.issues.filter(i => i.type === 'info').length,
    }

    const categories = this.issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    let summary = '📊 Security Audit Summary\n'
    summary += '========================\n\n'
    summary += `Total Issues: ${this.issues.length}\n`
    summary += `🔴 High Severity: ${counts.high}\n`
    summary += `🟡 Medium Severity: ${counts.medium}\n`
    summary += `🟢 Low Severity: ${counts.low}\n`
    summary += `ℹ️  Info: ${counts.info}\n\n`

    if (Object.keys(categories).length > 0) {
      summary += 'Categories:\n'
      Object.entries(categories)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, count]) => {
          summary += `  • ${category}: ${count}\n`
        })
      summary += '\n'
    }

    // Show top issues
    if (this.issues.length > 0) {
      summary += 'Top Issues:\n'
      this.issues
        .sort((a, b) => {
          const severityOrder = { high: 0, medium: 1, low: 2, info: 3 }
          return severityOrder[a.type] - severityOrder[b.type]
        })
        .slice(0, 5)
        .forEach((issue, index) => {
          const icon = issue.type === 'high' ? '🔴' : issue.type === 'medium' ? '🟡' : '🟢'
          summary += `  ${index + 1}. ${icon} ${issue.message} (${issue.file}:${issue.line || '?'})\n`
        })
      summary += '\n'
    }

    if (counts.high === 0 && counts.medium === 0) {
      summary += '✅ No critical security issues found!\n'
    } else {
      summary += '⚠️  Please review and address the identified security issues.\n'
    }

    return summary
  }

  // Export results to JSON
  public exportResults(outputPath: string): void {
    const results = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.issues.length,
        high: this.issues.filter(i => i.type === 'high').length,
        medium: this.issues.filter(i => i.type === 'medium').length,
        low: this.issues.filter(i => i.type === 'low').length,
        info: this.issues.filter(i => i.type === 'info').length,
      },
      issues: this.issues,
    }

    require('fs').writeFileSync(outputPath, JSON.stringify(results, null, 2))
    console.log(`📄 Results exported to ${outputPath}`)
  }
}

// Main execution
async function main() {
  const rootDir = process.cwd()
  const auditor = new SecurityAuditor(rootDir)
  
  try {
    const issues = await auditor.audit()
    
    // Export results if requested
    if (process.argv.includes('--export')) {
      const outputPath = join(rootDir, 'security-audit-results.json')
      auditor.exportResults(outputPath)
    }

    // Exit with error code if high severity issues found
    const highSeverityCount = issues.filter(i => i.type === 'high').length
    if (highSeverityCount > 0) {
      console.log(`\n❌ Audit failed: ${highSeverityCount} high severity issues found`)
      process.exit(1)
    } else {
      console.log('\n✅ Security audit completed successfully')
      process.exit(0)
    }
    
  } catch (error) {
    logger.error('Security audit failed', { error })
    console.error('❌ Security audit failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

export { SecurityAuditor, type SecurityIssue }