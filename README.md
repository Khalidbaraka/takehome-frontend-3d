# Takehome Project

Welcome to the 3D Take home Project, we are excited that you are considering joining Vention!

This take home is designed to simulate a simplified version of a 3D modeling application similar to MachineBuilder. In it you will find several intentional design flaws. The goal of this exercise is to evaluate your ability to read, understand, and improve existing code while implementing missing functionality.

Since there is a time constraint, we recommend focusing on delivering a functional and well-structured solution rather than aiming for perfection in every aspect. Prioritize code quality, maintainability, and performance improvements. Don't hesitate to make assumptions where necessary, but please document them clearly.

It's okay to not complete everything (there is _a lot_ that can be improved), we are more interested in your approach to iterative problem solving, code quality and design choices.

## Goal (feature request)

- The user should be able to remove a shape from the scene shape from the shape tree by clicking a "delete" button
  - The button should be next to each item in the tree

### Bonus goal

- Allow the user to see the shape's geometry type and color in the tree view

## AI tools usage

Feel free to use whatever you would use in your day to day work. However, if you do use AI tools please add a disclaimer saying which tool and in which part of the project.

## Getting Started

1. **Clone the Repository**: Start by cloning the repository to your local machine.
2. **Use correct Node version**: We recommend using [NVM](https://github.com/nvm-sh/nvm) to manage your Node versions. Run `nvm use` in the project root to switch to the correct Node version.
3. **Install Dependencies**: Navigate to the project directory and run `npm install` to install all necessary dependencies.
4. **Run the Application**: Use `npm start` to launch the application. It should open in your default web browser.
5. **Make sure tests are running**: Run `npm test` to ensure that the existing tests are passing.

## Product Requirements (already implemented)

**Project Name**:

- The user should be able to set and update the project name

**Shape Management**:

- The user should be able to add shapes (sphere, cube, cylinder) to the 3D scene
- The user should be able to remove shapes from the 3D scene
- The user should be able to select shapes in the 3D scene and in the shape list
- The user should be able to add shapes as children to existing shapes

**Shape Listing**:

- The user should be able to see a list of all shapes currently in the scene
- The user should be able to see the hierarchy of shapes (reflecting parent-child relationships)
- The user should be able to see the total amount of shapes visible in the scene

## Constraints

- Use React and TypeScript for the implementation.
- Use Three.js for 3D rendering.
- 1 week time-box. We define 1 week to give you enough time to work on it without interfering with your current responsibilities.

We don't expect you to build everything from scratch, feel free to use libraries that you think are appropriate for the task. Just make sure that your skills and work are clearly represented in the final submission.

## Evaluation Criteria

- **Functionality**: Successful implementation of the requested features.
- **Code Quality**: Cleanliness, readability, and maintainability of the code.
- **Complexity**: Space and time complexity. How would the application behave with 1000 shapes, what about 10 000?
- **Iterative Improvement**: How you approach design flaws while implementing new features. Your git history can help demonstrate this.

We encourage you to document an explanation of your approach to tackle this take home. It can be in any format you prefer (i.e. text, video, audio), just make sure we have access to it. If you do a video or audio try to keep it under 5 minutes.

## Contact

Feel free to reach out the recruiter or the hiring manager if you have any questions or need clarifications regarding the project. Good luck, and we look forward to seeing your work!
