# Contributing to DeltaDev Link

Thank you for your interest in contributing to DeltaDev Link! 🎉

## 🚀 How to Contribute

### Reporting Bugs
1. Check if the bug has already been reported in [Issues](https://github.com/TheHien04/Deltadev-link-/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser/device information

### Suggesting Features
1. Open an issue with the tag `enhancement`
2. Describe the feature and its benefits
3. Provide examples or mockups if possible

### Pull Requests
1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages: `git commit -m "Add: feature description"`
6. Push to your fork: `git push origin feature/your-feature-name`
7. Open a Pull Request

## 📝 Commit Message Guidelines

Use these prefixes:
- `Add:` New feature
- `Fix:` Bug fix
- `Update:` Modify existing feature
- `Remove:` Delete code/feature
- `Refactor:` Code restructuring
- `Docs:` Documentation changes
- `Style:` Formatting, no code change
- `Test:` Add/update tests

**Example:**
```
Add: WhatsApp integration for customer support
Fix: Cookie consent banner not showing on mobile
Update: Improve checkout flow UX
```

## 🔧 Development Setup

```bash
# Clone repository
git clone https://github.com/TheHien04/Deltadev-link-.git
cd Deltadev-link-

# Start local server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

## ✅ Code Standards

### HTML
- Use semantic HTML5 elements
- Add `aria-label` for accessibility
- Include `alt` text for all images
- Keep proper indentation (2 spaces)

### CSS
- Use Tailwind CSS classes when possible
- Custom CSS goes in appropriate files under `src/css/`
- Follow BEM naming for custom classes
- Mobile-first responsive design

### JavaScript
- Use ES6+ features
- Proper error handling
- Add JSDoc comments for functions
- No console.log in production code
- Keep functions small and focused

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader friendly
- Color contrast ratios

## 🧪 Testing

Before submitting PR:
- [ ] Test on Chrome, Firefox, Safari
- [ ] Test on mobile devices
- [ ] Check accessibility with screen reader
- [ ] Verify keyboard navigation
- [ ] Test all form submissions
- [ ] Check console for errors
- [ ] Verify responsive design

## 📚 Project Structure

```
├── index.html              # Main homepage
├── admin.html              # Admin dashboard
├── privacy-policy.html     # Privacy policy
├── terms-of-service.html   # Terms of service
├── public/                 # Public assets
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Service worker
│   └── robots.txt          # SEO robots file
└── src/
    ├── css/                # Stylesheets
    ├── js/                 # JavaScript
    └── assets/             # Images, fonts
```

## 🔒 Security

- Never commit sensitive data (API keys, passwords)
- Use environment variables for configs
- Sanitize all user inputs
- Follow OWASP security guidelines
- Report security issues privately

## 📄 License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).

## 💬 Questions?

- Open an issue for questions
- Contact: support@deltadevlink.com
- Phone: 0373948649

## 🙏 Thank You!

Every contribution makes DeltaDev Link better! 🚀
