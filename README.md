# 🌙 Lunna - Islamic Prayer Times & Moon Phase Tracker

A beautiful, feature-rich web application that provides Islamic prayer times, Qibla direction, moon phase tracking, and religious calendar information.

## ✨ Features

- **Prayer Times**: Accurate Islamic prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) based on your location
- **Moon Phase Tracking**: Real-time moon phase visualization with illumination percentage
- **Qibla Compass**: Live compass showing the direction to Mecca (Qibla)
- **Religious Calendar**: Islamic, Christian, and Jewish calendar integration
- **Location Management**: Search and save multiple prayer time locations
- **Solar Times**: Sunrise, sunset, and solar noon information
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Export Functionality**: Export prayer times and events to various formats
- **Notifications**: Get notified for upcoming prayer times

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Testing**: Vitest
- **Astronomical Calculations**: Custom lunar and solar ephemeris services
- **API**: Google Gemini API for enhanced features

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MilazimB/Lunna.git
   cd Lunna
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local` and add your `GEMINI_API_KEY`:
   ```bash
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI

## 📁 Project Structure

```
src/
├── components/          # React components
├── services/           # Business logic and API services
├── utils/              # Utility functions
├── types.ts            # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🌍 Astronomical Calculations

Lunna uses precise astronomical algorithms for:
- Lunar phase calculations with libration effects
- Solar position and time calculations
- Prayer time calculations based on solar angles
- Qibla direction calculation using spherical trigonometry

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues and submit pull requests.

## 📧 Contact

For questions or feedback, please reach out through GitHub issues.
