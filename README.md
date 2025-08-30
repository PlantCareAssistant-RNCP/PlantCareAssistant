<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->

[![Contributors][contributors-shield]][contributors-url]
[![project_license][license-shield]][license-url]
[![Docker][docker-shield]][docker-url]
[![Node.js][nodejs-shield]][nodejs-url]
[![LinkedIn: Bradley Hill][linkedin-shield]][linkedin-url-bradley] [![LinkedIn: Marie Coulay][linkedin-shield]][linkedin-url-marie]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant">
    <img src="plant-care-assistant/public/PlantCare_Logo.png" alt="Logo" width="80" height="80">
  </a>

<h3 align="center">Plant Care Assistant</h3>

  <p align="center">
    Plant Care Assistant is a Next.js application designed to help users manage their plants effectively. The application combines personal plant management with social networking features, allowing users to share their plant care journey with others. Additionally, it plans to incorporate plant identification capabilities to help users identify unknown plants.
    <br />
    <a href="https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <!-- No live demo yet -->
    <a href="https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>

    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li>
      <a href="#development">Development</a>
      <ul>
        <li><a href="#local-development">Local Development</a></li>
        <li><a href="#testing">Testing</a></li>
      </ul>
    </li>
    <li><a href="#api-overview">API Overview</a></li>
    <li><a href="#deployment">Deployment</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#database-architecture">Database Architecture</a></li>

  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Product Name Screen Shot][product-screenshot]](https://example.com)

Plant Care Assistant is a Next.js application designed to help users manage their plants effectively. The application combines personal plant management with social networking features, allowing users to share their plant care journey with others. Additionally, it plans to incorporate plant identification capabilities to help users identify unknown plants.

### Features

- 🌱 **Plant Management**: Track your plant collection with detailed profiles, care history, and growth monitoring
- 📅 **Care Scheduling**: Schedule watering, fertilizing, and other care activities with a comprehensive calendar
- 👥 **Social Networking**: Share your plant care journey, photos, and connect with other plant enthusiasts
- 🔔 **Notifications**: Get reminders for upcoming care tasks and plant care events
- 📱 **Responsive Design**: Works seamlessly across desktop and mobile devices
- 🔍 **Plant Identification**: Coming soon - identify unknown plants using AI-powered image recognition

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Next][Next.js]][Next-url]
- [![React][React.js]][React-url]
- [![Tailwind][TailwindCSS]][Tailwind-url]
- [![Prisma][Prisma]][Prisma-url]
- [![Supabase][Supabase]][Supabase-url]
- [![PostgreSQL][Postgres]][Postgres-url]
- [![TypeScript][TypeScript]][TypeScript-url]
- [![Luxon][Luxon]][Luxon-url]
- [![Playwright][Playwright]][Playwright-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

The fastest way to get Plant Care Assistant running locally is using Docker. This is the recommended installation method.

### Prerequisites

- [Docker](https://www.docker.com/get-started) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine
- Supabase account and credentials

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant.git
   cd PlantCareAssistant
   ```

2. **Copy the environment file and edit with your Supabase credentials:**

   ```bash
   cp plant-care-assistant/.env.example plant-care-assistant/.env
   # Edit plant-care-assistant/.env with your own Supabase credentials
   ```

3. **Start the application using Docker Compose:**

   ```bash
   docker compose up
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

> For production deployment, provide environment variables through your deployment platform as needed.

### Environment Variables

The following environment variables are required. You can copy the provided `.env.example` file and update it with your credentials:

```bash
# Database URLs (Prisma)
DATABASE_URL="postgresql://your_user:your_password@your_host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://your_user:your_password@your_host:5432/postgres"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase Service Role Key (for file uploads)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Development settings
# NODE_ENV="development"
# LOG_LEVEL="debug"
```

> **Note**: Replace `your_user`, `your_password`, `your_host`, `your-project-id`, `your_anon_key`, and `your_service_role_key` with your actual database and Supabase credentials. The `.env.example` file in the repository provides a template with all required variables.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEVELOPMENT -->

## Development

### Local Development

If you prefer to develop without Docker:

1. **Install dependencies:**

   ```bash
   cd plant-care-assistant
   npm install
   ```

2. **Set up the database:**

   ```bash
   # Push Prisma schema to the database
   npx prisma migrate dev --name init

   # Generate Prisma client
   npx prisma generate

   # Seed the database with initial data
   npx prisma db seed
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

### Testing

The project uses Playwright for end-to-end testing.

```bash
# Run all tests
npm run test

# Run tests with UI mode
npm run test:ui

# Generate test reports
npm run test:report
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- API OVERVIEW -->

## API Overview

Plant Care Assistant provides RESTful APIs for:

- **Authentication**: User registration, login, and session management via Supabase
- **Plants**: CRUD operations for plant management
- **Events**: Calendar events and care scheduling
- **Social**: Posts, comments, and likes for social networking
- **Users**: User profile management

For detailed API documentation, see the [API Documentation](API.md) file.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- DEPLOYMENT -->

## Deployment

For production deployment, provide environment variables through your deployment platform:

```bash
# Example for direct docker run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  -e DATABASE_URL=your-database-url \
  -e DIRECT_URL=your-direct-database-url \
  your-image-name
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

Plant Care Assistant is designed to be user-friendly and intuitive. Here are some examples of how to use the application:

- **Adding a new plant**: Navigate to the "My Plants" section and click on "Add Plant". Fill in the details about your plant, including its name, species, and care instructions.
- **Watering your plant**: When it's time to water your plant, you will receive a notification. Navigate to the plant's detail page and click on "Water Plant" to mark it as watered.
- **Sharing your plant care journey**: Take advantage of the social networking features by posting updates about your plants, sharing photos, and connecting with other plant enthusiasts.

_For more detailed instructions and advanced features, please refer to the [documentation](https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant)_

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Implement plant identification feature
- [ ] Add support for more plant species
- [ ] Improve social networking features
- [ ] Enhance user profile customization
- [ ] Develop mobile application version

See the [open issues](https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant/issues) for a full list of proposed features and known bugs.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Project Link: [https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant](https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- Hat tip to anyone whose code was used as inspiration
- Special thanks to the contributors who made this project possible
- Inspiration from other amazing open-source projects

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Project Structure

```
plant-care-assistant/
├── app/                      # Next.js App Router structure
│   ├── api/                  # API routes (auth, events, plants, social, users)
│   ├── dashboard/            # Dashboard page
│   ├── features/             # Feature-specific pages
│   ├── homepage/             # Main application homepage
│   ├── userprofile/          # User profile page
│   └── utils/                # Utility functions
├── components/               # Reusable React components
├── lib/                      # Library code (e.g., supabaseClient.ts)
├── prisma/                   # Prisma ORM configuration and migrations
├── supabase/                 # Supabase configuration and migrations
├── public/                   # Static assets
└── .env                      # Environment variables (not in repo)
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Database Architecture

Our application uses a dual-system approach for database management, leveraging the strengths of both Prisma and Supabase:

**Prisma Responsibilities**

- Schema definition and migrations
- Type-safe database queries and data manipulation
- Data seeding and TypeScript type generation

**Supabase Responsibilities**

- Authentication and session management
- Row Level Security (RLS) and policy management
- Security migrations

This separation allows us to use the right tool for each job:

- **Prisma** for data modeling and database interactions
- **Supabase** for authentication and security

When making changes:

1. Use Prisma migrations for schema/structural changes
2. Use Supabase migrations for security policies

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[contributors-shield]: https://img.shields.io/github/contributors/PlantCareAssistant-RNCP/PlantCareAssistant.svg?style=for-the-badge
[contributors-url]: https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant/graphs/contributors
[license-shield]: https://img.shields.io/github/license/PlantCareAssistant-RNCP/PlantCareAssistant.svg?style=for-the-badge
[license-url]: https://github.com/PlantCareAssistant-RNCP/PlantCareAssistant/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-blue?style=for-the-badge&logo=linkedin
[linkedin-url-bradley]: https://www.linkedin.com/in/bradley-hill-123456789/
[linkedin-url-marie]: https://www.linkedin.com/in/marie-coulay-987654321/
[next-url]: https://nextjs.org/
[next.js]: https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[react-url]: https://reactjs.org/
[react.js]: https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black
[tailwind-url]: https://tailwindcss.com/
[tailwindcss]: https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white
[prisma-url]: https://www.prisma.io/
[prisma]: https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white
[supabase-url]: https://supabase.com/
[supabase]: https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white
[postgres-url]: https://www.postgresql.org/
[postgres]: https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white
[typescript-url]: https://www.typescriptlang.org/
[typescript]: https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[luxon-url]: https://moment.github.io/luxon/
[luxon]: https://img.shields.io/badge/Luxon-007ACC?style=for-the-badge&logo=luxon&logoColor=white
[playwright-url]: https://playwright.dev/
[playwright]: https://img.shields.io/badge/Playwright-00A3E0?style=for-the-badge&logo=playwright&logoColor=white
[docker-shield]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[docker-url]: https://www.docker.com/
[nodejs-shield]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[nodejs-url]: https://nodejs.org/
