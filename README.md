# SwingAI

This is the beginning of the SwingAI Project! 

## Conceptual overview

This project aims to develop an AI-powered web application to assist in tracking and analyzing Unilateral Cerebral Palsy (UCP) in pediatric patients before and after botox treatment. The application provides a more advanced and objective method for assessing UCP conditions compared to traditional physical marker-based approaches.

## User Roles

### Doctors/Medical Professionals:

- Upload patient videos
- View AI-generated analysis of arm movement
- Access graphs of patient conditions

### Authorized Hospital Staff:

- Log in through secure hospital authentication system
- Manage patient records and video uploads

## Functional Requirements

### Login Page

- Secure authentication through hospital's system
- Restricted access for authorized personnel only

###  Homepage

- Interactive table tracking all the patients with video upload
- Clickable table cells that take you to instruction page
- Ability to add patients or edit name and/or dob 
- Ability to delete

### Instruction Page

- Simple interface
- Button to navigate to video upload and patient history page

### Patient History Page

- All previous video comparison results customized for each patient
- View button to view the more information

### Video Upload Page

- Upload up to 2 patient videos
- Support for video file processing
- Display processing animation during analysis
- Option of using different AI models for analysis
- Accurate AI analysis

### Results Page

- Display AI-generated analysis
- Graphical representation of arm movement angles
- Detailed insights into patient's UCP condition

## Tech Stack

### Web Application

- Frontend Framework: [Next.js](https://nextjs.org/)
- Backend: [Next.js](https://nextjs.org/) (integrated backend)
- Authentication: [Magic Link](https://magic.link/docs/home/welcome) (Temporary)
  - Hospital's authentication system (to be implemented)

### AI Model (Not implemented yet)

- Video Tracking: [MediaPipe](https://ai.google.dev/edge/mediapipe/solutions/guide)
- ML models: [SciKit-Learn](https://scikit-learn.org/stable/)
- Graphing: [Numpy](https://numpy.org/)
- Other ML/Data Analytic tools: [Pandas](https://pandas.pydata.org/)

### Cloud (Not implemented yet)

- Cloud Provider: Amazon Web Services (AWS)
- Storage: S3 Bucket
- Queuing: SQS
- Compute: Lambda Functions

### Database

- Database Language: SQLite

### Migration Scripts

- Initial schema was created no need for migration scripts

## Development Environment Setup
### Prerequisites

- Ensure Node.js is installed
- Ensure Python 3.10 is installed
- Docker (Optional, not implemented yet)
- AWS CLI configured with appropriate credentials (Optional, not implemented yet)

### Database Initialization

- cd web
- npx prisma generate

### Authentication Setup

- Coordinate with hospital IT for authentication integration
- Implement BetterAuth in future iterations

## Starting Project
### Running Front-End
1. Clone the repository:
  ```bash
  git clone https://github.com/UTDallasEPICS/Swing.git
  ```

2. Change directory to web folder
  ```bash
  cd web
  ```

3. Install dependencies:
  ```bash
  # npm
  npm install

  # pnpm
  pnpm install

  # yarn
  yarn install

  # bun
  bun install
  ```

4. Run the development server
  ```bash
  # npm
  npm run dev

  # pnpm
  pnpm run dev

  # yarn
  yarn dev

  # bun
  bun run dev
  ```
### Running ML currently
1. Clone the repository:
  ```bash
  git clone https://github.com/UTDallasEPICS/Swing.git
  ```

2. Change directory to ml folder
  ```bash
  cd ml
  ```

3. Install dependencies
  ```bash
    pip install -r requirements.txt
  ```

4. Run AI_Method.py or other .py files in the folder
  ```bash
  # Running AI_Method.py
  python AI_Method.py

  # General template
  python [pythonfile]
  ```
## For Mac, create a virtual environment for python if needed
```bash
cd ml
pathname -m venv .venv
source .venv/bin/activate
```
## Future Instructions (If AWS is implemented)
AWS configurations
- Use AWS Managment Console
- Login as root email/user
- Need MFA which is already configured
- Go into "Users"
- Click create "Access Key" for user (This creates access keys for users)
