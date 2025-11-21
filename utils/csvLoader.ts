
import { Hall, Brand, CarModel } from '../types';

export const parseBrandsCSV = async (csvUrl: string, skeletonHalls: Hall[]): Promise<Hall[]> => {
  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    // CSV Format: Hall,Booth,Brand,Category,Name,Tag,Note
    const rows = text.split('\n').slice(1).filter(r => r.trim() !== '');
    
    const updatedHalls = skeletonHalls.map(h => ({
      ...h,
      brands: [] as Brand[]
    }));

    const brandMap = new Map<string, Brand>();

    rows.forEach(row => {
      // Regex matches: split by comma ONLY if it's followed by an even number of quotes
      // This handles "Comma, Inside, Quote" correctly
      const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => {
          let val = c.trim();
          // Remove surrounding quotes
          if (val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
          }
          // Handle CSV escape for quote ("")
          return val.replace(/""/g, '"');
      });

      if (cols.length < 3) return;

      const [hallCode, booth, brandName, category, modelName, tag, note] = cols;

      const hallIndex = updatedHalls.findIndex(h => h.code === hallCode);
      if (hallIndex === -1) return;

      const brandId = `${hallCode}-${booth}`;

      let brand = brandMap.get(brandId);
      if (!brand) {
        brand = {
          id: brandId,
          booth: booth,
          name: brandName,
          description: '',
          models: [],
          fullModelList: []
        };
        brandMap.set(brandId, brand);
        updatedHalls[hallIndex].brands.push(brand);
      }

      if (category === 'Info') {
          if (note) brand.description = note;
      } 
      else if (category === 'Key') {
          if (modelName) {
              brand.models.push({
                  name: modelName,
                  highlight: tag || '',
                  isNewLaunch: true,
                  note: note // Capture note from CSV
              });
          }
      } 
      else if (category === 'Normal') {
          if (modelName) {
              if (!brand.fullModelList) brand.fullModelList = [];
              // Push full object structure instead of string
              brand.fullModelList.push({
                  name: modelName,
                  highlight: tag || '',
                  isNewLaunch: false,
                  note: note
              });
          }
      }
    });

    return updatedHalls;

  } catch (error) {
    console.error("Failed to load CSV data:", error);
    return skeletonHalls;
  }
};
