import { IPackConfig } from "ave-pack";

const config: IPackConfig = {
  build: {
    projectRoot: __dirname,
    target: "node14-win-x64",
    input: "./dist/_/_/app.js",
    output: "./bin/heard.exe",
    // set DEBUG_PKG=1
    debug: false, 
    edit: false
  },
  resource: {
    icon: "./assets/heard.ico",
    productVersion: "1.0.0",
    productName: "Heard",
    fileVersion: "1.0.0",
    companyName: "QberSoft",
    fileDescription: "A simple subtitle generator powered by whisper & avernakis react.",
    LegalCopyright: `© ${new Date().getFullYear()} QberSoft Copyright.`,
  },
};

export default config;
