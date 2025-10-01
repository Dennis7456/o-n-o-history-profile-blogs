#!/usr/bin/env python3
"""
Automated Kennedy Ogetto Content Scraper
Complete automation script for regular content updates
"""

import schedule
import time
import subprocess
import logging
from datetime import datetime
import json
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scraper.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AutomatedScraper:
    def __init__(self):
        self.scripts = [
            'simple_scraper.py',
            'enhanced_scraper.py',
            'integrate_new_content.py'
        ]
        
    def run_scraping_pipeline(self):
        """Run the complete scraping pipeline"""
        logger.info("Starting automated scraping pipeline...")
        
        try:
            # Step 1: Run simple scraper
            logger.info("Running simple scraper...")
            result = subprocess.run(['python3', 'simple_scraper.py'], 
                                  capture_output=True, text=True, timeout=300)
            if result.returncode != 0:
                logger.error(f"Simple scraper failed: {result.stderr}")
                return False
            
            # Step 2: Run enhanced scraper
            logger.info("Running enhanced scraper...")
            result = subprocess.run(['python3', 'enhanced_scraper.py'], 
                                  capture_output=True, text=True, timeout=600)
            if result.returncode != 0:
                logger.error(f"Enhanced scraper failed: {result.stderr}")
                return False
            
            # Step 3: Integrate content
            logger.info("Integrating new content...")
            result = subprocess.run(['python3', 'integrate_new_content.py'], 
                                  capture_output=True, text=True, timeout=120)
            if result.returncode != 0:
                logger.error(f"Content integration failed: {result.stderr}")
                return False
            
            logger.info("Scraping pipeline completed successfully!")
            self.log_scraping_stats()
            return True
            
        except subprocess.TimeoutExpired:
            logger.error("Scraping pipeline timed out")
            return False
        except Exception as e:
            logger.error(f"Scraping pipeline error: {e}")
            return False
    
    def log_scraping_stats(self):
        """Log statistics about the scraping results"""
        try:
            # Count blog posts
            with open('site/data/blog.json', 'r') as f:
                blog_data = json.load(f)
                total_posts = len(blog_data.get('blog', {}).get('posts', []))
            
            # Count timeline entries
            with open('site/data/kennedy-ogetto-cases-chronological.json', 'r') as f:
                timeline_data = json.load(f)
                total_timeline = len(timeline_data.get('kennedy_ogetto_cases', {}).get('timeline', []))
            
            logger.info(f"Current stats - Blog posts: {total_posts}, Timeline entries: {total_timeline}")
            
        except Exception as e:
            logger.error(f"Error logging stats: {e}")
    
    def backup_data(self):
        """Create backup of current data"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_dir = f"backups/{timestamp}"
            os.makedirs(backup_dir, exist_ok=True)
            
            # Backup main files
            files_to_backup = [
                'site/data/blog.json',
                'site/data/kennedy-ogetto-cases-chronological.json'
            ]
            
            for file_path in files_to_backup:
                if os.path.exists(file_path):
                    backup_path = os.path.join(backup_dir, os.path.basename(file_path))
                    subprocess.run(['cp', file_path, backup_path])
            
            logger.info(f"Data backed up to {backup_dir}")
            
        except Exception as e:
            logger.error(f"Backup failed: {e}")
    
    def cleanup_old_backups(self, keep_days=7):
        """Clean up old backup files"""
        try:
            import glob
            from pathlib import Path
            
            backup_dirs = glob.glob('backups/*')
            current_time = time.time()
            
            for backup_dir in backup_dirs:
                dir_time = os.path.getctime(backup_dir)
                if (current_time - dir_time) > (keep_days * 24 * 3600):
                    subprocess.run(['rm', '-rf', backup_dir])
                    logger.info(f"Removed old backup: {backup_dir}")
                    
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")

def daily_scraping_job():
    """Daily scraping job"""
    scraper = AutomatedScraper()
    
    # Create backup before scraping
    scraper.backup_data()
    
    # Run scraping pipeline
    success = scraper.run_scraping_pipeline()
    
    if success:
        logger.info("Daily scraping completed successfully")
    else:
        logger.error("Daily scraping failed")
    
    # Cleanup old backups
    scraper.cleanup_old_backups()

def weekly_deep_scrape():
    """Weekly comprehensive scraping"""
    logger.info("Starting weekly deep scrape...")
    
    # Run multiple iterations with different search terms
    search_terms = [
        "Kennedy Ogetto lawyer Kenya",
        "Kennedy Ogeto Solicitor General",
        "Kennedy Ogetto legal adviser Ruto",
        "Kennedy Ogetto Supreme Court",
        "Kennedy Ogetto ICC case"
    ]
    
    scraper = AutomatedScraper()
    scraper.backup_data()
    
    for term in search_terms:
        logger.info(f"Searching for: {term}")
        # You could modify the scrapers to accept search terms
        scraper.run_scraping_pipeline()
        time.sleep(60)  # Wait between searches
    
    logger.info("Weekly deep scrape completed")

if __name__ == "__main__":
    # Schedule jobs
    schedule.every().day.at("06:00").do(daily_scraping_job)
    schedule.every().week.do(weekly_deep_scrape)
    
    logger.info("Automated scraper started. Scheduled jobs:")
    logger.info("- Daily scraping at 06:00")
    logger.info("- Weekly deep scrape")
    
    # Run once immediately for testing
    logger.info("Running initial scrape...")
    daily_scraping_job()
    
    # Keep the scheduler running
    while True:
        schedule.run_pending()
        time.sleep(60)  # Check every minute