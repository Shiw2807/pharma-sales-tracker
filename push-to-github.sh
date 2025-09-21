#!/bin/bash

echo "======================================"
echo "Push to GitHub - Pharma Sales Tracker"
echo "======================================"
echo ""
echo "This script will help you push your code to GitHub."
echo ""
echo "First, create a new repository on GitHub:"
echo "1. Go to https://github.com/new"
echo "2. Name it: pharma-sales-tracker (or your preferred name)"
echo "3. DON'T initialize with README, .gitignore, or license"
echo "4. Click 'Create repository'"
echo ""
read -p "Press Enter when you've created the repository..."
echo ""
read -p "Enter your GitHub username: " username
read -p "Enter the repository name (default: pharma-sales-tracker): " repo_name

# Use default if no repo name provided
repo_name=${repo_name:-pharma-sales-tracker}

# Construct the remote URL
remote_url="https://github.com/${username}/${repo_name}.git"

echo ""
echo "Adding remote: ${remote_url}"
echo ""

# Add the remote
git remote add origin ${remote_url}

# Push all branches
echo "Pushing to GitHub..."
git push -u origin main
git push -u origin feature/complete-application

echo ""
echo "======================================"
echo "✅ Successfully pushed to GitHub!"
echo "======================================"
echo ""
echo "Your repository is now available at:"
echo "https://github.com/${username}/${repo_name}"
echo ""
echo "Branches pushed:"
echo "- main (default branch)"
echo "- feature/complete-application"
echo ""
echo "Next steps:"
echo "1. Clone on another machine: git clone ${remote_url}"
echo "2. Install dependencies: npm install (in both backend and frontend)"
echo "3. Set up .env file based on .env.example"
echo "4. Run the application using start.sh"
echo "======================================"