# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - heading "Strat Plan" [level=1] [ref=e5]
      - paragraph [ref=e6]: Strategic Planning System
    - generic [ref=e7]:
      - heading "Create your account" [level=2] [ref=e8]
      - paragraph [ref=e9]: Get started with strategic planning
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]: Full Name
          - textbox "Full Name" [ref=e13]
        - generic [ref=e14]:
          - generic [ref=e15]: Email address
          - textbox "Email address" [ref=e16]
        - generic [ref=e17]:
          - generic [ref=e18]: Password
          - textbox "Password" [ref=e19]
          - paragraph [ref=e20]: Must be at least 6 characters
        - button "Sign up" [ref=e21] [cursor=pointer]
        - paragraph [ref=e22]:
          - text: Already have an account?
          - link "Sign in" [ref=e23] [cursor=pointer]:
            - /url: /login
  - region "Notifications alt+T"
  - alert [ref=e24]
```