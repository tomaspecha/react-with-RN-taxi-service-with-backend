/*
 * VCE Vite config for React Native for TM352 Block 2
 *
 * Please modify the line that begins "base" below to configure for your account.
 *
 * This solution is based on the following sources:
 *    https://stereobooster.com/posts/react-native-web-with-vite/#final-config
 *    https://github.com/necolas/react-native-web/discussions/2201
 * 
 * Change log:
 *    13/09/2023 C Thomson, Intial version.
 *    15/01/2024 A Thomson, Fixed line 41 to unclude USERID.
 */

import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";

const extensions = [
    ".web.tsx",
    ".tsx",
    ".web.ts",
    ".ts",
    ".web.jsx",
    ".jsx",
    ".web.js",
    ".js",
    ".css",
    ".json",
    ".mjs",
];

const development = process.env.NODE_ENV === "development";

export default defineConfig({
    clearScreen: true,

    // Modify the following line to replace USERID with your userid.
    // To find the USERID, click on Open in new Tab at the top of the screen and then look at the URL
    // in the new browser tab. You will see that it contains the text /user/USERID/. Use that number
    // in the configuration file and you are ready to go.
    base: '/user/USERID/proxy/absolute/5173',

    // If running the VCE locally remove the above line and use the following instead:
    // base: '/proxy/absolute/5173',

    plugins: [react()],
    define: {
        global: "window",
        __DEV__: JSON.stringify(development),
        DEV: JSON.stringify(development),
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    resolve: {
        extensions: extensions,
        alias: {
            "react-native": "react-native-web",
        },
    },
    optimizeDeps: {
        esbuildOptions: {
            resolveExtensions: extensions,
            jsx: "automatic",
            loader: {".js": "jsx"},
        },
    },
});