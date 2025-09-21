#!/bin/bash

echo "========================================="
echo "Git Push Helper for Pharma Sales Tracker"
echo "========================================="
echo ""

# Check if remote is configured
if git remote | grep -q origin; then
    echo "✓ Remote 'origin' is already configured"
    git remote -v
else
    echo "No remote repository configured."
    echo "Please enter your GitHub repository URL:"
    echo "Example: https://github.com/yourusername/pharma-sales-tracker.git"
    read -p "Repository URL: " repo_url
    
    if [ -z "$repo_url" ]; then
        echo "❌ No URL provided. Exiting."
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo "✓ Remote 'origin' added successfully"
fi

echo ""
echo "Current branch:"
git branch --show-current

echo ""
echo "Recent commits:"
git log --oneline -5

echo ""
echo "Ready to push changes to GitHub?"
read -p "Continue? (y/n): " confirm

if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
    echo "Pushing to origin..."
    git push -u origin $(git branch --show-current)
    echo "✓ Changes pushed successfully!"
else
    echo "Push cancelled."
fi