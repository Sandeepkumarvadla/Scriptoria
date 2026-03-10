🎬 Coffee-with-Cinema
Coffee-with-Cinema is an innovative AI-powered Storyboard and Script Generator designed to revolutionize the pre-production workflow. By transforming simple concepts into professional creative packages, it empowers filmmakers and content creators to move from "idea" to "production-ready" in seconds.

🚀 Key Features
AI Screenplay Generation: Automatically generates industry-standard scripts with proper formatting.

Deep Character Profiling: Creates psychological breakdowns, arcs, and motivations for every character.

Atmospheric Sound Design: Generates detailed audio plans tailored to the emotional beats of each scene.

Multi-Format Export: Download your work instantly as PDF, DOCX, or TXT.

Cinematic UI: A sleek, dark-mode "Studio" interface built for modern creators.

🛠️ The Tech Stack
AI & Machine Learning
Google Gemini 1.5 Flash: The core engine providing lightning-fast, high-intelligence content generation.

Frontend & UI
React 18 & TypeScript: For a robust, type-safe component architecture.

Vite: High-performance build tool for a near-instant development experience.

Tailwind CSS: Utility-first styling for a custom cinematic aesthetic.

Framer Motion: Smooth transitions and professional animations.

Lucide React: A clean and consistent iconography system.

Utilities & Exports
docx: Programmatic Microsoft Word document generation.

jspdf: Browser-based PDF creation with custom styling.

File-Saver: Handles client-side file downloads.

DOMPurify: Ensures all user inputs are sanitized and secure.

📦 Installation & Setup
Clone the repository:

Bash
git clone https://github.com/your-username/coffee-with-cinema.git
cd coffee-with-cinema
Install dependencies:

Bash
npm install
Set up Environment Variables:
Create a .env file in the root directory and add your Google Gemini API key:

Code snippet
VITE_GEMINI_API_KEY=your_api_key_here
Run the development server:

Bash
npm run dev
Build for production:

Bash
npm run build
🖥️ How it Works
Enter Concept: Provide a simple story idea (e.g., "A king and his 7 sons").

Process: The Gemini 1.5 Flash model analyzes the prompt and generates a structured response containing the screenplay, character profiles, and sound design.

Refine: Review the generated content in the interactive terminal.

Export: Select your preferred format (PDF/DOCX) to take your project to the next stage of production.

🛡️ Security
The application implements DOMPurify to sanitize all user-generated prompts, protecting the system against XSS (Cross-Site Scripting) and ensuring a safe environment for creative collaboration.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

Developed with ❤️ for the filmmaking community.
