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

### Homepage

- Simple interface
- Button to navigate to video upload page

### Video Upload Page

- Upload up to 2 patient videos
- Support for video file processing
- Display processing animation during analysis

### Results Page

- Display AI-generated analysis
- Graphical representation of arm movement angles
- Detailed insights into patient's UCP condition

## Tech Stack

### Web Application

- Frontend Framework: Next.js
- Backend: Next.js (integrated backend)
- Authentication: Hospital's authentication system (to be implemented)

### AI Model (Not implemented yet)

- AI Library: MediaPipe/SciKit-Learn
- Video Analysis: Custom AI model for body point mapping and angle tracking using Scikit-Learn

### Cloud (Not implemented yet)

- Cloud Provider: Amazon Web Services (AWS)
- Storage: S3 Bucket
- Queuing: SQS
- Compute: Lambda Functions

### Migration Scripts

- No existing data migration required at this stage

## Development Environment Setup
### Prerequisites

- Ensure Node.js is installed
- Ensure Python 3.12 is installed
- Docker (optional)
- AWS CLI configured with appropriate credentials (Optional, not implemented yet)

### Database Initialization

- No local database setup required (no database implemented yet)

### Authentication Setup

- Coordinate with hospital IT for authentication integration
- Implement Auth0 or similar service in future iterations

## Starting Project
### Running Front-End
1. Clone the repository:
  ```bash
  git clone https://github.com/UTDallasEPICS/Swing.git
  ```

2. Install dependencies:
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

3. Run AI_Method.py or other .py files in the folder
  ```bash
  # Running AI_Method.py
  Python AI_Method.py

  # General template
  Python [pythonfile]
  ```

## Future Instructions (If AWS is implemented)
AWS configurations
- Use AWS Managment Console
- Login as root email/user
- Need MFA which is already configured
- Go into "Users"
- Click create "Access Key" for user (This creates access keys for users)
