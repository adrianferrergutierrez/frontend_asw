# ASW_Copia_Issues_Taiga_Frontend_React

Project developed during the 6th trimester for the Applications and Web Services (ASW) subject ([Course Info](https://www.fib.upc.edu/en/studies/bachelors-degrees/bachelor-degree-informatics-engineering/curriculum/syllabus/ASW)) at FIB, Universitat Politècnica de Catalunya in Barcelona.  
It was implemented using **React** and **Vite** as the frontend framework, and **TypeScript** as the programming language.  
The project applies concepts and techniques learned throughout the course and consumes the API previously developed using Ruby on Rails, available here:  
🔗 https://github.com/it13aprojecte1/ASW_Copia_Issues_Taiga_Backend_StaticSite

The project was developed by:
* Adrián Ferrer  
* Óscar Cerezo  
* Jan Santos  
* Francesc Pérez

Taiga board used to manage the project:  
🔗 https://tree.taiga.io/project/jansanbas-it13a_project/timeline  
This frontend corresponds to the **3rd Sprint** of the project.

The project backend is deployed on Render:  🔗 [https://waslab04-uscf.onrender.com](https://waslab04-uscf.onrender.com)

The project itself is deployed on Render:
🔗 [https://taiga-issues-frontend-copia.onrender.com/](https://taiga-issues-frontend-copia.onrender.com/)

It should be noted that the static site allows logging in with multiple accounts. However, the web app does not include any login system; instead, it uses a hardcoded profile through which you can already access and test the API's functionalities.


---

## User Manual

### How to test it

There are two ways to test this project:

---

### ✅ Option 1: Use the deployed version on Render

You can directly test the app using the following link (please note that Render may take 1–2 minutes to load initially):  
🔗 [https://taiga-issues-frontend-copia.onrender.com](https://taiga-issues-frontend-copia.onrender.com/)

---

### 🖥️ Option 2: Run it locally on your machine (Windows instructions)

#### 1. Install Node.js (Windows)

Go to [https://nodejs.org/](https://nodejs.org/) and download the installer. Follow the instructions to complete the installation.  
To verify that Node.js and npm were installed correctly, open a terminal and run:

```bash
node -v
npm -v

Clone the repo to your machine by clicking the Code button on the GitHub page and copying the URL. Then, in your terminal:

```bash
git clone <URL_OF_THE_REPOSITORY>
cd mi_frontend
```

Run the following commands to install the dependencies and start the development server:

```bash
npm install
npm run dev
```

You will see a local URL like:

```bash
http://localhost:5173
```
Copy and paste this link into your browser to use the application locally.



## Images of the web app
![alt text] (https://github.com/adrianferrergutierrez/frontend_asw/blob/main/Captura%20de%20pantalla%20(2).png)
![alt text](https://github.com/adrianferrergutierrez/frontend_asw/blob/main/Captura%20de%20pantalla%20(3).png)
![alt text](https://github.com/adrianferrergutierrez/frontend_asw/blob/main/Captura%20de%20pantalla%20(4).png)

## Project Summary

This project is a simplified version of Taiga's issue tracker, developed using React and TypeScript.
It features a web app that includes the same functionalities implemented on the static site (except for the login feature), which was built with Ruby on Rails and serves as the backend.

