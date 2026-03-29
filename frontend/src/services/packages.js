/**
 * Local package catalog. Data: `src/data/packagesData.js`.
 * Add Cloudinary (or any HTTPS) image URLs in that file and in `resourcesData.js`.
 */

import { PACKAGES } from '../data/packagesData.js';

const clone = (obj) => JSON.parse(JSON.stringify(obj));

const packageService = {
  fetchPackages: async (category = null) => {
    let list = PACKAGES.filter((p) => p.isActive !== false);
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    return {
      success: true,
      packages: list.map(clone),
      count: list.length,
    };
  },

  fetchPackageById: async (packageId) => {
    const pkg = PACKAGES.find((p) => p._id === packageId);
    if (!pkg || pkg.isActive === false) {
      throw new Error('Package not found');
    }
    return {
      success: true,
      package: clone(pkg),
    };
  },
};

export default packageService;
