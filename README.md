![KoopaLabs Artifacts](https://lapislabs.dev/images/KoopaLabsArtifcates.png)

# KoopaLabs Plugin Build Dashboard

A transparent, real-time build dashboard for KoopaLabs Minecraft plugins. We believe in complete transparency with our development process, which is why both this dashboard and our plugins are open source.

## About KoopaLabs

At KoopaLabs, we believe in:
- 🌟 Complete transparency in development
- 🤝 Community-driven improvements
- 🔓 Open source development
- 🚀 Continuous integration and deployment
- 📈 Real-time build access

This dashboard is part of our commitment to transparency, allowing users to:
- Download development builds directly
- View detailed commit information
- Track changes in real-time
- Access source code freely
- Report issues easily

## Features

- 🚀 Real-time build status and downloads
- 📊 Detailed commit information and changes
- 🔍 Live search across all plugins
- 🎨 Modern, responsive interface
- 🔗 Integration with Modrinth for stable releases
- 📦 Direct artifact downloads
- 🐛 One-click issue reporting

## Open Source Commitment

While this dashboard is open source and available for anyone to use, it was specifically built for KoopaLabs plugins. You're welcome to:
- Fork and modify for your own use
- Contribute improvements back to the project
- Use it as a reference for similar projects
- Suggest new features

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A GitHub account with repositories using GitHub Actions
- GitHub Personal Access Token with proper permissions

### Installation

1. Clone the repository:
```bash
git clone https://github.com/KoopaCode/build-dashboard.git
cd build-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
GITHUB_TOKEN=your_github_token_here
GITHUB_USERNAME=your_github_username
```

4. Start the development server:
```bash
npm run dev
```

### GitHub Token Permissions

Your GitHub token needs these permissions:
- `actions` (read)
- `contents` (read)
- `metadata` (read)
- `packages` (read)

## Contributing

We welcome contributions! Whether it's:
- Bug fixes
- Feature additions
- Documentation improvements
- UI enhancements

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Quick Deploy

Deploy your own instance of the dashboard:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FKoopaCode%2Fartifact-dashboard&env=GITHUB_TOKEN,GITHUB_USERNAME&envDescription=GitHub%20credentials%20needed%20for%20the%20dashboard%20to%20function&envLink=https%3A%2F%2Fgithub.com%2Fsettings%2Ftokens)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/KoopaCode/artifact-dashboard)
[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/template/artifact-dashboard)
[![Run on Replit](https://replit.com/badge/github/KoopaCode/artifact-dashboard)](https://replit.com/github/KoopaCode/artifact-dashboard)

Each platform requires:
- GitHub Token with proper permissions
- GitHub Username
- Repository access

## Environment Variables

Required environment variables:
- `GITHUB_TOKEN`: Your GitHub Personal Access Token
- `GITHUB_USERNAME`: Your GitHub username

## License

This project is open source under the MIT License. While you're free to use and modify it, we ask that you:
- Credit KoopaLabs when using the code
- Maintain the open source spirit
- Share your improvements with the community

## Links

<div align="center">
  <table>
    <tr>
      <td align="center" width="200">
        <a href="https://modrinth.com/user/Koopa">
          <img src="https://cdn.modrinth.com/modrinth-new.png" alt="Modrinth" width="64" height="64" style="border-radius: 8px"/>
          <br />
          <b>Stable Releases</b>
          <br />
          <sub>Download verified builds</sub>
        </a>
      </td>
      <td align="center" width="200">
        <a href="https://github.com/KoopaCode">
          <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" width="64" height="64"/>
          <br />
          <b>GitHub Profile</b>
          <br />
          <sub>View source code</sub>
        </a>
      </td>
      <td align="center" width="200">
        <a href="https://discord.gg/KmHGjaHWct">
          <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="Discord" width="64" height="64"/>
          <br />
          <b>Discord Community</b>
          <br />
          <sub>Join our community</sub>
        </a>
      </td>
    </tr>
  </table>
</div>

## Support

Need help? Have questions?
- Open an issue on GitHub
- Join our Discord community
- Check our documentation (soon)

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by [GitHub API](https://docs.github.com/en/rest)