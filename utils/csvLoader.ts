import { Hall, Brand } from '../types';

export const parseBrandsCSV = async (csvUrl: string, skeletonHalls: Hall[]): Promise<Hall[]> => {
  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    // CSV Format: Hall,Booth,Brand,Category,Name,Tag,Note
    // Category:
    // 'Info' -> Defines Brand, Booth, Description (Note)
    // 'Key' -> Adds to brand.models with isNewLaunch=true (Highlight)
    // 'Normal' -> Adds to brand.fullModelList (Text List)
    
    const rows = text.split('\n').slice(1).filter(r => r.trim() !== '');
    
    // Clone skeleton
    const updatedHalls = skeletonHalls.map(h => ({
      ...h,
      brands: [] as Brand[]
    }));

    const brandMap = new Map<string, Brand>();

    rows.forEach(row => {
      // Handle commas inside content if needed, but for now simple split works with provided data
      const cols = row.split(',').map(c => c.trim());
      if (cols.length < 3) return;

      const [hallCode, booth, brandName, category, modelName, tag, note] = cols;

      // 1. Find Hall
      const hallIndex = updatedHalls.findIndex(h => h.code === hallCode);
      if (hallIndex === -1) return;

      // 2. Unique Brand ID
      const brandId = `${hallCode}-${booth}`;

      // 3. Get or Create Brand
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

      // 4. Parse Category
      if (category === 'Info') {
          if (note) brand.description = note;
      } 
      else if (category === 'Key') {
          if (modelName) {
              brand.models.push({
                  name: modelName,
                  highlight: tag || '',
                  isNewLaunch: true
              });
          }
      } 
      else if (category === 'Normal') {
          if (modelName) {
              if (!brand.fullModelList) brand.fullModelList = [];
              const displayName = tag ? `${modelName} (${tag})` : modelName;
              brand.fullModelList.push(displayName);
          }
      }
    });

    return updatedHalls;

  } catch (error) {
    console.error("Failed to load CSV data:", error);
    return skeletonHalls;
  }
};