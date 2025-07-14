import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Path to the collection folder
    const collectionPath = path.join(process.cwd(), 'collection');
    
    // Read all files in the collection directory
    const files = fs.readdirSync(collectionPath);
    
    // Filter for JSON files
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Read and parse each JSON file
    const testersData = jsonFiles.map(file => {
      const filePath = path.join(collectionPath, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      try {
        return JSON.parse(fileContent);
      } catch (error) {
        console.error(`Error parsing JSON from ${file}:`, error);
        return null;
      }
    }).filter(Boolean); // Remove any null entries (failed parses)
    
    return NextResponse.json(testersData);
  } catch (error) {
    console.error('Error fetching tester results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tester results' },
      { status: 500 }
    );
  }
}