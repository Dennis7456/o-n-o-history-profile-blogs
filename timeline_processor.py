#!/usr/bin/env python3
"""
Timeline Data Processor
Processes scraped data and creates chronological timeline entries
"""

import json
from datetime import datetime
import re

class TimelineProcessor:
    def __init__(self):
        self.event_types = {
            'appointment': 'Government Appointment',
            'case': 'Legal Case',
            'court': 'Court Appearance',
            'judgment': 'Legal Judgment',
            'submission': 'Legal Submission',
            'statement': 'Public Statement',
            'award': 'Recognition/Award',
            'education': 'Educational Milestone'
        }
    
    def parse_date(self, date_string):
        """Parse various date formats"""
        date_patterns = [
            r'(\d{4}-\d{2}-\d{2})',  # YYYY-MM-DD
            r'(\d{1,2})\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})',  # DD Month YYYY
            r'(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})',  # Month DD, YYYY
        ]
        
        for pattern in date_patterns:
            match = re.search(pattern, date_string, re.IGNORECASE)
            if match:
                if pattern == date_patterns[0]:  # YYYY-MM-DD
                    return match.group(1)
                elif pattern == date_patterns[1]:  # DD Month YYYY
                    day, month, year = match.groups()
                    month_num = self.month_to_number(month)
                    return f"{year}-{month_num:02d}-{int(day):02d}"
                elif pattern == date_patterns[2]:  # Month DD, YYYY
                    month, day, year = match.groups()
                    month_num = self.month_to_number(month)
                    return f"{year}-{month_num:02d}-{int(day):02d}"
        
        return None
    
    def month_to_number(self, month_name):
        """Convert month name to number"""
        months = {
            'january': 1, 'february': 2, 'march': 3, 'april': 4,
            'may': 5, 'june': 6, 'july': 7, 'august': 8,
            'september': 9, 'october': 10, 'november': 11, 'december': 12
        }
        return months.get(month_name.lower(), 1)
    
    def determine_event_type(self, title, content):
        """Determine the type of event based on content"""
        text = (title + ' ' + content).lower()
        
        for keyword, event_type in self.event_types.items():
            if keyword in text:
                return event_type
        
        # More specific checks
        if any(word in text for word in ['appointed', 'nomination', 'confirmed']):
            return 'Government Appointment'
        elif any(word in text for word in ['court', 'hearing', 'trial', 'proceeding']):
            return 'Court Appearance'
        elif any(word in text for word in ['judgment', 'ruling', 'decision', 'verdict']):
            return 'Legal Judgment'
        elif any(word in text for word in ['submission', 'argument', 'brief']):
            return 'Legal Submission'
        
        return 'Legal Event'
    
    def extract_legal_context(self, content):
        """Extract legal context and significance"""
        legal_contexts = {
            'constitutional': 'Constitutional law matter involving interpretation of Kenya\'s constitution',
            'election': 'Electoral law case related to Kenya\'s democratic processes',
            'international': 'International law matter involving cross-border legal issues',
            'criminal': 'Criminal law case involving serious criminal charges',
            'investment': 'Investment law dispute involving international arbitration',
            'administrative': 'Administrative law matter involving government operations'
        }
        
        content_lower = content.lower()
        for keyword, context in legal_contexts.items():
            if keyword in content_lower:
                return context
        
        return 'General legal matter'
    
    def create_timeline_entry(self, title, content, date, sources=None, event_type=None):
        """Create a timeline entry from scraped data"""
        
        parsed_date = self.parse_date(date) if isinstance(date, str) else date
        if not event_type:
            event_type = self.determine_event_type(title, content)
        
        # Generate description (first 200 characters of content)
        description = content[:200] + "..." if len(content) > 200 else content
        
        timeline_entry = {
            "date": parsed_date,
            "event_type": event_type,
            "title": title,
            "description": description,
            "significance": self.determine_significance(content),
            "sources": sources or [],
            "related_cases": self.extract_related_cases(content),
            "legal_context": self.extract_legal_context(content),
            "metadata": {
                "word_count": len(content.split()),
                "extracted_date": parsed_date,
                "confidence_level": "High" if sources else "Medium"
            }
        }
        
        return timeline_entry
    
    def determine_significance(self, content):
        """Determine the significance of the event"""
        high_significance = ['supreme court', 'solicitor general', 'icc', 'constitutional amendment']
        medium_significance = ['high court', 'court of appeal', 'government appointment']
        
        content_lower = content.lower()
        
        if any(term in content_lower for term in high_significance):
            return 'High - Landmark legal event with national/international significance'
        elif any(term in content_lower for term in medium_significance):
            return 'Medium - Important legal matter with significant implications'
        else:
            return 'Standard - Regular legal proceeding or professional activity'
    
    def extract_related_cases(self, content):
        """Extract references to related cases"""
        # Look for case references, petition numbers, etc.
        case_patterns = [
            r'Petition\s+No\.?\s*(\d+)',
            r'Case\s+No\.?\s*([A-Z0-9/-]+)',
            r'ICC-\d+/\d+-\d+/\d+-\d+',
            r'ICSID\s+Case\s+No\.?\s*([A-Z0-9/-]+)'
        ]
        
        related_cases = []
        for pattern in case_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            related_cases.extend(matches)
        
        return related_cases
    
    def sort_timeline_entries(self, entries):
        """Sort timeline entries chronologically"""
        return sorted(entries, key=lambda x: x['date'] if x['date'] else '9999-12-31')
    
    def merge_with_existing_timeline(self, new_entries, existing_timeline_path):
        """Merge new entries with existing timeline"""
        try:
            with open(existing_timeline_path, 'r', encoding='utf-8') as f:
                existing_data = json.load(f)
            
            # Handle the existing structure which has cases under kennedy_ogetto_cases
            if 'kennedy_ogetto_cases' in existing_data:
                existing_entries = existing_data.get('kennedy_ogetto_cases', {}).get('timeline', [])
                
                # If timeline doesn't exist, create it
                if 'timeline' not in existing_data['kennedy_ogetto_cases']:
                    existing_data['kennedy_ogetto_cases']['timeline'] = []
                    existing_entries = []
            else:
                existing_entries = existing_data.get('timeline', [])
            
            all_entries = existing_entries + new_entries
            
            # Remove duplicates based on date and title
            unique_entries = []
            seen = set()
            
            for entry in all_entries:
                key = (entry['date'], entry['title'])
                if key not in seen:
                    unique_entries.append(entry)
                    seen.add(key)
            
            # Sort chronologically
            sorted_entries = self.sort_timeline_entries(unique_entries)
            
            # Update the structure
            if 'kennedy_ogetto_cases' in existing_data:
                existing_data['kennedy_ogetto_cases']['timeline'] = sorted_entries
                if 'metadata' not in existing_data['kennedy_ogetto_cases']:
                    existing_data['kennedy_ogetto_cases']['metadata'] = {}
                existing_data['kennedy_ogetto_cases']['metadata']['total_timeline_entries'] = len(sorted_entries)
                existing_data['kennedy_ogetto_cases']['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d")
            else:
                existing_data['timeline'] = sorted_entries
                if 'metadata' not in existing_data:
                    existing_data['metadata'] = {}
                existing_data['metadata']['total_entries'] = len(sorted_entries)
                existing_data['metadata']['last_updated'] = datetime.now().strftime("%Y-%m-%d")
            
            return existing_data
            
        except FileNotFoundError:
            # Create new timeline structure matching existing format
            return {
                "kennedy_ogetto_cases": {
                    "metadata": {
                        "title": "Kennedy Ogetto Legal Career Timeline",
                        "total_timeline_entries": len(new_entries),
                        "last_updated": datetime.now().strftime("%Y-%m-%d")
                    },
                    "timeline": self.sort_timeline_entries(new_entries)
                }
            }

# Example usage
processor = TimelineProcessor()

# Example timeline entry
sample_entry = processor.create_timeline_entry(
    title="Kennedy Ogetto Appointed as Legal Adviser to President Ruto",
    content="President William Ruto appointed Kennedy Ogetto as his legal adviser, bringing extensive experience from his role as Solicitor General and international legal practice.",
    date="2023-03-01",
    sources=[{
        "url": "https://example.com/appointment-news",
        "title": "Ruto Appoints Legal Adviser",
        "publication": "Daily Nation",
        "date": "2023-03-01",
        "type": "News Article"
    }]
)

print(json.dumps(sample_entry, indent=2))