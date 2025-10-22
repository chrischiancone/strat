# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - heading "Strat Plan" [level=1] [ref=e5]
      - paragraph [ref=e6]: Strategic Planning System
    - generic [ref=e7]:
      - heading "Sign in to your account" [level=2] [ref=e8]
      - paragraph [ref=e9]: Access your strategic planning dashboard
      - generic [ref=e10]:
        - alert [ref=e11]: Invalid email or password. Please check your credentials and try again.
        - generic [ref=e12]:
          - generic [ref=e13]: Email address
          - textbox "Email address" [ref=e14]: test@example.com
        - generic [ref=e15]:
          - generic [ref=e16]: Password
          - textbox "Password" [ref=e17]: TestPassword123!
        - button "Sign in" [active] [ref=e18] [cursor=pointer]
        - paragraph [ref=e19]: Click to sign in to your account
        - paragraph [ref=e20]:
          - text: Don't have an account?
          - link "Sign up" [ref=e21] [cursor=pointer]:
            - /url: /signup
  - region "Notifications alt+T"
  - alert [ref=e22]
```