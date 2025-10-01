#!/usr/bin/env python3
"""
Cleanup unnecessary files from the Kennedy Ogeto CMS project
"""

import os
import shutil

def cleanup_project():
    """Remove unnecessary files and directories"""
    
    # Files to remove
    files_to_remove = [
        # Old profile image scripts
        'complete-profile-update.py',
        'create-base64-image.py',
        'fix-profile-image.py',
        'fix-profile-rls.sql',
        'get-instagram-image.html',
        'manual-profile-update.py',
        'set-profile-image.py',
        'test-image-url.py',
        'test-profile-image.py',
        'update-profile-direct.py',
        'update-profile-image.py',
        'upload-local-image.py',
        'profile photo.html',
        'profile_image_url.txt',
        'PROFILE_IMAGE_UPDATE_SUMMARY.md',
        
        # Old setup and test files
        'check-database-content.py',
        'check-profile.py',
        'create-admin.py',
        'final-status-check.py',
        'fix-database.sql',
        'migrate-existing-data.py',
        'setup-database.py',
        'setup-simple-database.py',
        'simple-setup.py',
        'test-connection.py',
        'test-frontend-connection.js',
        'test-frontend-db.js',
        
        # Old scraping files (keep main ones)
        'blog_template_generator.py',
        'company-profile.json',
        'kennedy-ogetto-research.md',
        
        # Duplicate or old data files
        'blog.json',
        'kennedy-ogetto-cases-chronological.json',
        
        # Old documentation (will be replaced)
        'add-admin-sql.md',
        'DATABASE_SETUP_GUIDE.md',
        'FINAL_SETUP_INSTRUCTIONS.md',
        'SCRAPING_README.md',
        'STATUS_SUMMARY.md',
        'SUPABASE_SETUP.md',
        
        # Old shell scripts (will be replaced)
        'setup.sh',
        'setup-frontend.sh',
        'start-cms.sh',
        'start-dev-server.sh',
        
        # Config files that are no longer needed
        'config.env',
        'netlify.toml'
    ]
    
    # Directories to remove
    dirs_to_remove = [
        'backups',
        'data',
        'logs',
        '__pycache__'
    ]
    
    print("🧹 Cleaning up Kennedy Ogeto CMS project...")
    
    removed_files = 0
    removed_dirs = 0
    
    # Remove files
    for file_path in files_to_remove:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"✅ Removed file: {file_path}")
                removed_files += 1
            except Exception as e:
                print(f"❌ Error removing {file_path}: {e}")
        else:
            print(f"ℹ️  File not found: {file_path}")
    
    # Remove directories
    for dir_path in dirs_to_remove:
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            try:
                shutil.rmtree(dir_path)
                print(f"✅ Removed directory: {dir_path}")
                removed_dirs += 1
            except Exception as e:
                print(f"❌ Error removing {dir_path}: {e}")
        else:
            print(f"ℹ️  Directory not found: {dir_path}")
    
    print(f"\n📊 Cleanup Summary:")
    print(f"   Files removed: {removed_files}")
    print(f"   Directories removed: {removed_dirs}")
    
    # Show remaining important files
    print(f"\n📁 Remaining important files:")
    important_files = [
        'README.md',
        'QUICK_START.md',
        'requirements.txt',
        'restart-frontend.sh',
        'complete-migration.py',
        'automated_scraper.py',
        'enhanced_scraper.py',
        'main-scraper.py',
        'simple_scraper.py',
        'content-generator.py',
        'integrate_new_content.py',
        'scraping-strategy.py',
        'timeline_processor.py',
        'data-sources.md'
    ]
    
    for file_path in important_files:
        if os.path.exists(file_path):
            print(f"   ✅ {file_path}")
        else:
            print(f"   ❌ {file_path} (missing)")
    
    print(f"\n🎯 Next steps:")
    print(f"   1. Update documentation")
    print(f"   2. Test the application")
    print(f"   3. Commit changes to git")

if __name__ == "__main__":
    cleanup_project()