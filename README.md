# AI YouTube Shorts Generator  

🚀 **AI YouTube Shorts Generator** is a SaaS platform that simplifies creating engaging YouTube Shorts using AI-powered technologies. Users can generate high-quality, customized videos by selecting a content topic, image style, voice, and more. The platform automates the entire process, delivering a ready-to-use video in just a few minutes.  

## 🌟 Features  

- **Free Credits:** Users receive 30 credits upon signup (each short costs 10 credits).  
- **Customizability:**  
  - Choose from predefined or custom topics.  
  - Select image styles (realistic, anime, LEGO, etc.).  
  - Customize voices and video duration.  
- **AI-Powered Generation:** Fully automated process for script, audio, captions, and images.  
- **Efficient Processing:** Background tasks are handled with workers, ensuring a smooth user experience.  
- **Fast Results:** Videos are ready in 2-3 minutes.  

## 🛠️ Tech Stack  

- **Frontend:**  
  - Next.js  
  - TailwindCSS  

- **Backend:**  
  - PostgreSQL  
  - Inngest (for background workers)  
  - Edge-TTS (for Text-to-Speech API)  
  - Assembly AI (for captions)  

- **AI Models:**  
  - GeminiAI (for script generation)  
  - Flux-1 Hugging Face model (for images)  

- **Video Rendering:**  
  - Remotion (to convert generated content into video format)  

## 🎮 How It Works  

1. **User Flow:**  
   - Login/signup to the platform.  
   - Receive 30 free credits.  
   - Navigate to the **Create Page** and select:  
     - Content topic (predefined or custom).  
     - Image style (realistic, anime, LEGO, etc.).  
     - Voice type and video duration.  
   - Click "Generate" and wait for 2-3 minutes.  

2. **Behind the Scenes:**  
   - Script is generated using **GeminiAI**.  
   - Audio is processed using **Edge-TTS**.  
   - Captions are transcribed using **Assembly AI**.  
   - Images are created with the **Flux-1 Hugging Face model**.  
   - All tasks run as background workers via **Inngest**.  
   - The final video is rendered using **Remotion**.  

3. **Dashboard:**  
   - Generated videos are saved and displayed in the user dashboard.  

## 💻 Installation  

### Prerequisites  
Ensure you have the following installed:  
- Node.js  
- PostgreSQL  
- Yarn or npm  

### Steps  

1. **Clone the repository:**
   ```bash  
   git clone https://github.com/MukeshKr55/ai-youtube-shorts-generator.git  
   cd ai-youtube-shorts-generator
   ```
   
2. **Install dependencies:**
    ```bash
    yarn install  
    # or  
    npm install  
    ```
    
 3. **Set up the database:**
    - Create a PostgreSQL database.
    - Update the .env file with your database connection string and other required environment variables.

4. **Start the development server:**
    ```bash
    yarn dev  
    # or  
    npm run dev
    ```

5. **Visit the application at http://localhost:3000**

## 🎥 Demo  

Check out the live demo here: [AI YouTube Shorts Generator](https://ai-youtube-shorts-generator-coral.vercel.app/).  

## 📸 Screenshots  

### Create Page  
![Create Page Screenshot](https://github.com/user-attachments/assets/ea7470c8-6c43-4eb1-905e-8ba1ef54e159)


### Dashboard  
![Dashboard Screenshot](https://github.com/user-attachments/assets/9e00bab7-c0a8-4418-9638-3a0a4b5ec35e)
![Player](https://github.com/user-attachments/assets/1b29668f-1d11-44fe-9dc1-49e1a3eaefa1)



### Video Output  
![Video Output Screenshot](https://via.placeholder.com/800x400?text=Video+Preview)  


