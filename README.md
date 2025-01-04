# React Native Taxi Service App

## Overview
This is a simple taxi service app built using **React Native** with Expo framework. It allows users to register, offer taxi services, and make requests using a friendly and responsive UI. The application leverages location services and connects to the TaxiService API.

---

## Features

- **User Authentication**:
    - Allows users to register with a unique user ID.

- **Taxi Service Offer and Request**:
    - Users can offer or request taxi services by providing relevant details such as location, wait time, and timing.

- **Location Services**:
    - Uses Expo's `Location` library to fetch and display the user's current GPS location.

- **Interactive UI Components**:
    - Includes reusable components like `AddressPicker`, `TimePicker`, and `WaitTime` for an intuitive experience.

- **Integration with TaxiService API**:
    - Manages orders, cancellations, and matches with the TaxiService API.

---

## Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** (16.x or later recommended)
- **Expo CLI**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/react-native-taxi-service.git
   cd react-native-taxi-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Use the Expo app or an emulator to run the application.

---

## Project Structure

```
react-native-taxi-service/
├── components/            # Reusable UI components
├── libraries/             # Custom service libraries
├── assets/                # Static assets (images, etc.)
├── App.tsx                # Main application entry point
├── package.json           # Project dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── babel.config.js        # Babel configuration
└── index.js               # Entry file
```

---

## Usage

### Owner Offer
- Select the **waiting address**, **start time**, and **wait duration**.
- Click `Make` to post an offer.
- Click `Cancel` to cancel an active offer.
- Click `Matches` to view available matches.

### Customer Request
- Select the **pickup address** and **pickup time**.
- Click `Make` to post a request.
- Click `Cancel` to cancel an active request.
- Click `Matches` to view available matches.

### Login
- Enter a unique `User ID` to register and start using the app.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes and push the branch.
4. Open a pull request.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

---
