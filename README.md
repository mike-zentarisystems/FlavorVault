# Studio: Next.js + Firebase FlavorVault

A premium recipe and pantry management application built with Next.js 15, Firebase (Firestore, Auth), and Radix UI.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- A Firebase Project

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/mjuba/studio.git
   cd studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with your Firebase configuration.

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:9002](http://localhost:9002) for local development.

The production app is live at **[flavorvault.zentarisystems.io](https://flavorvault.zentarisystems.io)**.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore)
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Google Sign-In)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (Google AI)

## 📖 Documentation

Detailed documentation for the project's core systems can be found in the `docs/` directory:

- [**Firebase Integration**](docs/FIREBASE.md) - Learn about initialization, SDK usage, and App Hosting.
- [**Authentication Guide**](docs/AUTH.md) - Details on Google Sign-In flow and auth state management.
- [**Firestore Guide**](docs/FIRESTORE.md) - Guide to our NoSQL schema and real-time custom hooks.

## 🔒 Security

This project uses strict Firestore Security Rules to ensure data privacy:
- Users can only access their own data under `/users/{userId}`.
- Administrative access is granted to specifically approved emails (e.g., `carolynjuba@gmail.com`).

## 📄 License

This project is licensed under the MIT License.
