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
        - generic [ref=e11]:
          - generic [ref=e12]: Email address
          - textbox "Email address" [active] [ref=e13]
        - generic [ref=e14]:
          - generic [ref=e15]: Password
          - textbox "Password" [ref=e16]
        - button "Sign in" [ref=e17] [cursor=pointer]
        - paragraph [ref=e18]: Click to sign in to your account
        - paragraph [ref=e19]:
          - text: Don't have an account?
          - link "Sign up" [ref=e20] [cursor=pointer]:
            - /url: /signup
  - region "Notifications alt+T"
  - alert [ref=e21]
```