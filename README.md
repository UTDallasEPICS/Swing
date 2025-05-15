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
- Video Analysis: Custom AI model for body point mapping and angle tracking

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
- Docker (optional)
- AWS CLI configured with appropriate credentials

### Database Initialization

- No local database setup required (uses AWS services)

### Authentication Setup

- Coordinate with hospital IT for authentication integration
- Implement Auth0 or similar service in future iterations

## Starting Project

1. Clone the repository:

  git clone https://github.com/UTDallasEPICS/Swing.git

2. Install dependencies:
  ```bash
  # npm [Default, use this unless told otherwise]
  npm install

  # pnpm
  pnpm install

  # yarn
  yarn install

  # bun
  bun install
  ```

3. AWS configurations
  Use AWS Managment Console
Login as root email/user
Need MFA which is already configured
Go into "Users"
Click create "Access Key" for user (This creates access keys for users)

5. Run the development server
npm run dev
