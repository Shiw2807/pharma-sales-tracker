#!/bin/bash

echo "======================================"
echo "Git Remote Setup for Pharma Sales Tracker"
echo "======================================"
echo ""
echo "Please create a new repository on GitHub first:"
echo "1. Go to https://github.com/new"
echo "2. Name it: pharma-sales-tracker"
echo "3. Don't initialize with README (we already have one)"
echo "4. Create the repository"
echo ""
read -p "Enter your GitHub username: " username
read -p "Enter the repository name (default: pharma-sales-tracker): " repo_name

# Use default if no repo name provided
repo_name=${repo_name:-pharma-sales-tracker}

# Construct the remote URL
remote_url="https://github.com/${username}/${repo_name}.git"

echo ""
echo "Setting up remote: ${remote_url}"
echo ""

# Add the remote
git remote add origin ${remote_url}

# Push the main branch first
echo "Pushing main branch..."
git push -u origin master

# Push the feature branch
echo "Pushing feature branch..."
git checkout feature/manager-sales-fix
git push -u origin feature/manager-sales-fix

echo ""
echo "======================================"
echo "✅ Remote setup complete!"
echo "======================================"
echo ""
echo "Your repository is now available at:"
echo "https://github.com/${username}/${repo_name}"
echo ""
echo "Current branch: feature/manager-sales-fix"
echo ""
echo "The following has been pushed:"
echo "- master branch (initial commit)"
echo "- feature/manager-sales-fix branch (with manager sales fix)"
echo "======================================"