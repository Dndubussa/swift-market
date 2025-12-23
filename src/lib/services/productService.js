import { supabase } from '../supabase';

/**
 * Product Service - Handles all product-related operations
 */

/**
 * Upload a product image to Supabase Storage
 * @param {File} file - The image file to upload
 * @param {string} vendorId - The vendor's ID
 * @returns {Promise<{url: string, path: string} | null>}
 */
export async function uploadProductImage(file, vendorId) {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${vendorId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error in uploadProductImage:', error);
    return null;
  }
}

/**
 * Delete a product image from Supabase Storage
 * @param {string} path - The storage path of the image
 */
export async function deleteProductImage(path) {
  try {
    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);

    if (error) {
      console.error('Error deleting image:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteProductImage:', error);
    return false;
  }
}

/**
 * Generate a URL-friendly slug from product name
 * @param {string} name - The product name
 * @returns {string}
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
}

/**
 * Create a new product
 * @param {Object} productData - The product data
 * @param {File[]} images - Array of image files
 * @returns {Promise<{success: boolean, product?: Object, error?: string}>}
 */
export async function createProduct(productData, images = []) {
  try {
    const { 
      name, 
      description, 
      price, 
      compareAtPrice,
      categoryId, 
      stockQuantity, 
      lowStockThreshold,
      sku,
      weight,
      dimensions,
      isActive = true,
      isFeatured = false,
      vendorId 
    } = productData;

    // Generate slug
    const slug = generateSlug(name);

    // Create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        category_id: categoryId || null,
        name,
        slug,
        description,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock_quantity: parseInt(stockQuantity) || 0,
        low_stock_threshold: parseInt(lowStockThreshold) || 10,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        dimensions: dimensions || null,
        is_active: isActive,
        is_featured: isFeatured
      })
      .select()
      .single();

    if (productError) {
      console.error('Error creating product:', productError);
      return { success: false, error: productError.message };
    }

    // Upload images if provided
    if (images.length > 0) {
      const imagePromises = images.map(async (file, index) => {
        const uploadResult = await uploadProductImage(file, vendorId);
        if (uploadResult) {
          return {
            product_id: product.id,
            image_url: uploadResult.url,
            alt_text: `${name} - Image ${index + 1}`,
            display_order: index,
            is_primary: index === 0
          };
        }
        return null;
      });

      const uploadedImages = await Promise.all(imagePromises);
      const validImages = uploadedImages.filter(img => img !== null);

      if (validImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(validImages);

        if (imagesError) {
          console.error('Error saving product images:', imagesError);
        }
      }
    }

    // Fetch the complete product with images
    const completeProduct = await getProductById(product.id);
    return { success: true, product: completeProduct };
  } catch (error) {
    console.error('Error in createProduct:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update an existing product
 * @param {string} productId - The product ID
 * @param {Object} productData - The updated product data
 * @param {File[]} newImages - New image files to add
 * @param {string[]} imagesToDelete - Image paths to delete
 * @returns {Promise<{success: boolean, product?: Object, error?: string}>}
 */
export async function updateProduct(productId, productData, newImages = [], imagesToDelete = []) {
  try {
    const { 
      name, 
      description, 
      price, 
      compareAtPrice,
      categoryId, 
      stockQuantity, 
      lowStockThreshold,
      sku,
      weight,
      dimensions,
      isActive,
      isFeatured,
      vendorId 
    } = productData;

    // Update the product
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (compareAtPrice !== undefined) updateData.compare_at_price = compareAtPrice ? parseFloat(compareAtPrice) : null;
    if (categoryId !== undefined) updateData.category_id = categoryId || null;
    if (stockQuantity !== undefined) updateData.stock_quantity = parseInt(stockQuantity);
    if (lowStockThreshold !== undefined) updateData.low_stock_threshold = parseInt(lowStockThreshold);
    if (sku !== undefined) updateData.sku = sku || null;
    if (weight !== undefined) updateData.weight = weight ? parseFloat(weight) : null;
    if (dimensions !== undefined) updateData.dimensions = dimensions || null;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (isFeatured !== undefined) updateData.is_featured = isFeatured;
    updateData.updated_at = new Date().toISOString();

    const { data: product, error: productError } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .single();

    if (productError) {
      console.error('Error updating product:', productError);
      return { success: false, error: productError.message };
    }

    // Delete specified images
    if (imagesToDelete.length > 0) {
      // Delete from storage
      for (const path of imagesToDelete) {
        await deleteProductImage(path);
      }
      
      // Delete from database
      const { error: deleteError } = await supabase
        .from('product_images')
        .delete()
        .eq('product_id', productId)
        .in('image_url', imagesToDelete.map(path => {
          const { data } = supabase.storage.from('product-images').getPublicUrl(path);
          return data.publicUrl;
        }));

      if (deleteError) {
        console.error('Error deleting product images from database:', deleteError);
      }
    }

    // Upload new images
    if (newImages.length > 0) {
      // Get current max display order
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('display_order')
        .eq('product_id', productId)
        .order('display_order', { ascending: false })
        .limit(1);

      const startOrder = existingImages?.[0]?.display_order ?? -1;

      const imagePromises = newImages.map(async (file, index) => {
        const uploadResult = await uploadProductImage(file, vendorId);
        if (uploadResult) {
          return {
            product_id: productId,
            image_url: uploadResult.url,
            alt_text: `${name || product.name} - Image ${startOrder + index + 2}`,
            display_order: startOrder + index + 1,
            is_primary: false
          };
        }
        return null;
      });

      const uploadedImages = await Promise.all(imagePromises);
      const validImages = uploadedImages.filter(img => img !== null);

      if (validImages.length > 0) {
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(validImages);

        if (imagesError) {
          console.error('Error saving new product images:', imagesError);
        }
      }
    }

    // Fetch the complete updated product
    const completeProduct = await getProductById(productId);
    return { success: true, product: completeProduct };
  } catch (error) {
    console.error('Error in updateProduct:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a product
 * @param {string} productId - The product ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteProduct(productId) {
  try {
    // Get product images first
    const { data: images } = await supabase
      .from('product_images')
      .select('image_url')
      .eq('product_id', productId);

    // Delete images from storage
    if (images?.length > 0) {
      for (const img of images) {
        // Extract path from URL
        const url = new URL(img.image_url);
        const path = url.pathname.split('/product-images/')[1];
        if (path) {
          await deleteProductImage(path);
        }
      }
    }

    // Delete product (cascades to product_images)
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Error deleting product:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteProduct:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a product by ID
 * @param {string} productId - The product ID
 * @returns {Promise<Object | null>}
 */
export async function getProductById(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        vendor:vendor_profiles(id, business_name, user_id),
        images:product_images(id, image_url, alt_text, display_order, is_primary)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
}

/**
 * Get products by vendor
 * @param {string} vendorId - The vendor profile ID
 * @param {Object} options - Query options
 * @returns {Promise<{products: Object[], count: number}>}
 */
export async function getProductsByVendor(vendorId, options = {}) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      isActive = null,
      categoryId = null,
      search = ''
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        images:product_images(id, image_url, alt_text, display_order, is_primary)
      `, { count: 'exact' })
      .eq('vendor_id', vendorId);

    if (isActive !== null) {
      query = query.eq('is_active', isActive);
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching vendor products:', error);
      return { products: [], count: 0 };
    }

    return { products: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getProductsByVendor:', error);
    return { products: [], count: 0 };
  }
}

/**
 * Get all products for the marketplace
 * @param {Object} options - Query options
 * @returns {Promise<{products: Object[], count: number}>}
 */
export async function getMarketplaceProducts(options = {}) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      categoryId = null,
      categorySlug = null,
      minPrice = null,
      maxPrice = null,
      search = '',
      isFeatured = null
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        vendor:vendor_profiles(id, business_name),
        images:product_images(id, image_url, alt_text, display_order, is_primary)
      `, { count: 'exact' })
      .eq('is_active', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (categorySlug) {
      query = query.eq('category.slug', categorySlug);
    }

    if (minPrice !== null) {
      query = query.gte('price', minPrice);
    }

    if (maxPrice !== null) {
      query = query.lte('price', maxPrice);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (isFeatured !== null) {
      query = query.eq('is_featured', isFeatured);
    }

    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching marketplace products:', error);
      return { products: [], count: 0 };
    }

    return { products: data || [], count: count || 0 };
  } catch (error) {
    console.error('Error in getMarketplaceProducts:', error);
    return { products: [], count: 0 };
  }
}

/**
 * Get all categories
 * @returns {Promise<Object[]>}
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, parent_id, is_active, display_order, is_digital_friendly, is_physical_friendly')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getCategories:', error);
    return [];
  }
}

/**
 * Get vendor profile by user ID
 * @param {string} userId - The user ID
 * @returns {Promise<Object | null>}
 */
export async function getVendorProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('vendor_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching vendor profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getVendorProfile:', error);
    return null;
  }
}

/**
 * Set primary image for a product
 * @param {string} productId - The product ID
 * @param {string} imageId - The image ID to set as primary
 */
export async function setPrimaryImage(productId, imageId) {
  try {
    // First, unset all primary flags
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Then set the new primary
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) {
      console.error('Error setting primary image:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in setPrimaryImage:', error);
    return false;
  }
}

/**
 * Update product stock
 * @param {string} productId - The product ID
 * @param {number} quantity - New stock quantity
 */
export async function updateProductStock(productId, quantity) {
  try {
    const { error } = await supabase
      .from('products')
      .update({ 
        stock_quantity: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (error) {
      console.error('Error updating stock:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateProductStock:', error);
    return false;
  }
}

// ============================================
// DIGITAL PRODUCT FUNCTIONS
// ============================================

/**
 * Upload a digital product file to Supabase Storage
 * @param {File} file - The digital file to upload
 * @param {string} vendorId - The vendor's ID
 * @param {string} productId - The product ID
 * @returns {Promise<{path: string, size: number, type: string} | null>}
 */
export async function uploadDigitalFile(file, vendorId, productId) {
  try {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${vendorId}/${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('digital-products')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading digital file:', error);
      return null;
    }

    return {
      path: data.path,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('Error in uploadDigitalFile:', error);
    return null;
  }
}

/**
 * Delete a digital file from Supabase Storage
 * @param {string} path - The storage path of the file
 */
export async function deleteDigitalFile(path) {
  try {
    const { error } = await supabase.storage
      .from('digital-products')
      .remove([path]);

    if (error) {
      console.error('Error deleting digital file:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in deleteDigitalFile:', error);
    return false;
  }
}

/**
 * Get human-readable file format from MIME type
 * @param {string} mimeType - The MIME type
 * @param {string} fileName - The file name
 * @returns {string}
 */
function getFileFormat(mimeType, fileName) {
  const ext = fileName.split('.').pop().toUpperCase();
  const formats = {
    'application/pdf': 'PDF',
    'application/epub+zip': 'EPUB',
    'application/x-mobipocket-ebook': 'MOBI',
    'application/zip': 'ZIP',
    'application/x-rar-compressed': 'RAR',
    'audio/mpeg': 'MP3',
    'audio/mp4': 'M4A',
    'video/mp4': 'MP4',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/msword': 'DOC'
  };
  return formats[mimeType] || ext || 'FILE';
}

/**
 * Format file size to human readable string
 * @param {number} bytes - Size in bytes
 * @returns {string}
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a digital product with files
 * @param {Object} productData - The product data
 * @param {File[]} images - Array of image files for product display
 * @param {File[]} digitalFiles - Array of digital product files
 * @param {Object} digitalSettings - Digital product settings
 * @returns {Promise<{success: boolean, product?: Object, error?: string}>}
 */
export async function createDigitalProduct(productData, images = [], digitalFiles = [], digitalSettings = {}) {
  try {
    const { 
      name, 
      description, 
      price, 
      compareAtPrice,
      categoryId, 
      sku,
      isActive = true,
      isFeatured = false,
      vendorId 
    } = productData;

    // Generate slug
    const slug = generateSlug(name);

    // Create the product with is_digital = true
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        vendor_id: vendorId,
        category_id: categoryId || null,
        name,
        slug,
        description,
        price: parseFloat(price),
        compare_at_price: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock_quantity: 999999, // Unlimited for digital
        low_stock_threshold: 0,
        sku: sku || null,
        is_active: isActive,
        is_featured: isFeatured,
        is_digital: true,
        requires_shipping: false
      })
      .select()
      .single();

    if (productError) {
      console.error('Error creating digital product:', productError);
      return { success: false, error: productError.message };
    }

    // Upload product images (for display)
    if (images.length > 0) {
      const imagePromises = images.map(async (file, index) => {
        const uploadResult = await uploadProductImage(file, vendorId);
        if (uploadResult) {
          return {
            product_id: product.id,
            image_url: uploadResult.url,
            alt_text: `${name} - Image ${index + 1}`,
            display_order: index,
            is_primary: index === 0
          };
        }
        return null;
      });

      const uploadedImages = await Promise.all(imagePromises);
      const validImages = uploadedImages.filter(img => img !== null);

      if (validImages.length > 0) {
        await supabase.from('product_images').insert(validImages);
      }
    }

    // Upload digital files
    if (digitalFiles.length > 0) {
      const filePromises = digitalFiles.map(async (file, index) => {
        const uploadResult = await uploadDigitalFile(file, vendorId, product.id);
        if (uploadResult) {
          return {
            product_id: product.id,
            file_name: file.name,
            file_url: uploadResult.path, // Store path, not public URL
            file_path: uploadResult.path,
            file_size: uploadResult.size,
            file_type: uploadResult.type,
            file_format: getFileFormat(uploadResult.type, file.name),
            is_preview: false,
            display_order: index
          };
        }
        return null;
      });

      const uploadedFiles = await Promise.all(filePromises);
      const validFiles = uploadedFiles.filter(f => f !== null);

      if (validFiles.length > 0) {
        const { error: filesError } = await supabase
          .from('digital_product_files')
          .insert(validFiles);

        if (filesError) {
          console.error('Error saving digital files:', filesError);
        }
      }
    }

    // Create digital product settings
    const {
      maxDownloads = 5,
      downloadExpiryDays = 30,
      allowMultipleDevices = true
    } = digitalSettings;

    const { error: settingsError } = await supabase
      .from('digital_product_settings')
      .insert({
        product_id: product.id,
        max_downloads: maxDownloads,
        download_expiry_days: downloadExpiryDays,
        allow_multiple_devices: allowMultipleDevices,
        instant_delivery: true
      });

    if (settingsError) {
      console.error('Error saving digital settings:', settingsError);
    }

    // Fetch the complete product
    const completeProduct = await getDigitalProductById(product.id);
    return { success: true, product: completeProduct };
  } catch (error) {
    console.error('Error in createDigitalProduct:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a digital product
 * @param {string} productId - The product ID
 * @param {Object} productData - The updated product data
 * @param {File[]} newImages - New image files to add
 * @param {string[]} imagesToDelete - Image paths to delete
 * @param {File[]} newDigitalFiles - New digital files to add
 * @param {string[]} digitalFilesToDelete - Digital file IDs to delete
 * @param {Object} digitalSettings - Updated digital settings
 */
export async function updateDigitalProduct(
  productId, 
  productData, 
  newImages = [], 
  imagesToDelete = [],
  newDigitalFiles = [],
  digitalFilesToDelete = [],
  digitalSettings = null
) {
  try {
    // First update the basic product
    const result = await updateProduct(productId, productData, newImages, imagesToDelete);
    if (!result.success) {
      return result;
    }

    // Delete specified digital files
    if (digitalFilesToDelete.length > 0) {
      for (const fileId of digitalFilesToDelete) {
        // Get file path first
        const { data: fileData } = await supabase
          .from('digital_product_files')
          .select('file_path')
          .eq('id', fileId)
          .single();

        if (fileData?.file_path) {
          await deleteDigitalFile(fileData.file_path);
        }

        // Delete from database
        await supabase
          .from('digital_product_files')
          .delete()
          .eq('id', fileId);
      }
    }

    // Upload new digital files
    if (newDigitalFiles.length > 0) {
      const { vendorId } = productData;
      
      // Get current max display order
      const { data: existingFiles } = await supabase
        .from('digital_product_files')
        .select('display_order')
        .eq('product_id', productId)
        .order('display_order', { ascending: false })
        .limit(1);

      const startOrder = existingFiles?.[0]?.display_order ?? -1;

      const filePromises = newDigitalFiles.map(async (file, index) => {
        const uploadResult = await uploadDigitalFile(file, vendorId, productId);
        if (uploadResult) {
          return {
            product_id: productId,
            file_name: file.name,
            file_url: uploadResult.path,
            file_path: uploadResult.path,
            file_size: uploadResult.size,
            file_type: uploadResult.type,
            file_format: getFileFormat(uploadResult.type, file.name),
            is_preview: false,
            display_order: startOrder + index + 1
          };
        }
        return null;
      });

      const uploadedFiles = await Promise.all(filePromises);
      const validFiles = uploadedFiles.filter(f => f !== null);

      if (validFiles.length > 0) {
        await supabase.from('digital_product_files').insert(validFiles);
      }
    }

    // Update digital settings if provided
    if (digitalSettings) {
      const { error: settingsError } = await supabase
        .from('digital_product_settings')
        .upsert({
          product_id: productId,
          max_downloads: digitalSettings.maxDownloads,
          download_expiry_days: digitalSettings.downloadExpiryDays,
          allow_multiple_devices: digitalSettings.allowMultipleDevices,
          updated_at: new Date().toISOString()
        }, { onConflict: 'product_id' });

      if (settingsError) {
        console.error('Error updating digital settings:', settingsError);
      }
    }

    // Fetch complete updated product
    const completeProduct = await getDigitalProductById(productId);
    return { success: true, product: completeProduct };
  } catch (error) {
    console.error('Error in updateDigitalProduct:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a digital product by ID with all related data
 * @param {string} productId - The product ID
 * @returns {Promise<Object | null>}
 */
export async function getDigitalProductById(productId) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(id, name, slug),
        vendor:vendor_profiles(id, business_name, user_id),
        images:product_images(id, image_url, alt_text, display_order, is_primary),
        digital_files:digital_product_files(id, file_name, file_size, file_type, file_format, version, is_preview, display_order),
        digital_settings:digital_product_settings(id, max_downloads, download_expiry_days, allow_multiple_devices, instant_delivery)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching digital product:', error);
      return null;
    }

    // Format file sizes for display
    if (data?.digital_files) {
      data.digital_files = data.digital_files.map(file => ({
        ...file,
        file_size_formatted: formatFileSize(file.file_size)
      }));
    }

    return data;
  } catch (error) {
    console.error('Error in getDigitalProductById:', error);
    return null;
  }
}

/**
 * Get buyer's purchased digital products with download info
 * @param {string} buyerId - The buyer's user ID
 * @returns {Promise<Object[]>}
 */
export async function getBuyerDigitalPurchases(buyerId) {
  try {
    const { data, error } = await supabase
      .from('purchase_downloads')
      .select(`
        *,
        digital_file:digital_product_files(
          id, 
          file_name, 
          file_size, 
          file_format,
          product:products(id, name, slug)
        ),
        order_item:order_items(
          id,
          order:orders(id, order_number, created_at)
        )
      `)
      .eq('buyer_id', buyerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching digital purchases:', error);
      return [];
    }

    // Format and add status
    return (data || []).map(purchase => {
      const isExpired = new Date(purchase.expires_at) < new Date();
      const downloadsRemaining = purchase.max_downloads - purchase.download_count;
      
      return {
        ...purchase,
        is_expired: isExpired,
        downloads_remaining: downloadsRemaining,
        can_download: !isExpired && downloadsRemaining > 0,
        file_size_formatted: formatFileSize(purchase.digital_file?.file_size || 0)
      };
    });
  } catch (error) {
    console.error('Error in getBuyerDigitalPurchases:', error);
    return [];
  }
}

/**
 * Record a download attempt
 * @param {string} purchaseDownloadId - The purchase download record ID
 * @param {string} ipAddress - The IP address
 * @param {string} userAgent - The user agent string
 */
export async function recordDownload(purchaseDownloadId, ipAddress = '', userAgent = '') {
  try {
    // Get current record
    const { data: current, error: fetchError } = await supabase
      .from('purchase_downloads')
      .select('*')
      .eq('id', purchaseDownloadId)
      .single();

    if (fetchError || !current) {
      return { success: false, error: 'Download record not found' };
    }

    // Check if can download
    const isExpired = new Date(current.expires_at) < new Date();
    if (isExpired) {
      return { success: false, error: 'Download link has expired' };
    }

    if (current.download_count >= current.max_downloads) {
      return { success: false, error: 'Maximum downloads reached' };
    }

    // Update record
    const ipAddresses = [...(current.ip_addresses || [])];
    if (ipAddress && !ipAddresses.includes(ipAddress)) {
      ipAddresses.push(ipAddress);
    }

    const userAgents = [...(current.user_agents || [])];
    if (userAgent && !userAgents.some(ua => ua === userAgent)) {
      userAgents.push(userAgent);
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from('purchase_downloads')
      .update({
        download_count: current.download_count + 1,
        first_download_at: current.first_download_at || now,
        last_download_at: now,
        ip_addresses: ipAddresses,
        user_agents: userAgents
      })
      .eq('id', purchaseDownloadId);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in recordDownload:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get a signed URL for downloading a digital file
 * Only works for authenticated buyers who have purchased the product
 * @param {string} purchaseDownloadId - The purchase download record ID
 * @param {string} buyerId - The buyer's user ID (for verification)
 */
export async function getSecureDownloadUrl(purchaseDownloadId, buyerId) {
  try {
    // Verify the purchase belongs to the buyer
    const { data: purchase, error: purchaseError } = await supabase
      .from('purchase_downloads')
      .select(`
        *,
        digital_file:digital_product_files(file_path, file_name)
      `)
      .eq('id', purchaseDownloadId)
      .eq('buyer_id', buyerId)
      .single();

    if (purchaseError || !purchase) {
      return { success: false, error: 'Purchase not found or unauthorized' };
    }

    // Check if can download
    const isExpired = new Date(purchase.expires_at) < new Date();
    if (isExpired) {
      return { success: false, error: 'Download link has expired' };
    }

    if (purchase.download_count >= purchase.max_downloads) {
      return { success: false, error: 'Maximum downloads reached' };
    }

    // Create signed URL (valid for 1 hour)
    const { data: signedUrl, error: signError } = await supabase.storage
      .from('digital-products')
      .createSignedUrl(purchase.digital_file.file_path, 3600, {
        download: purchase.digital_file.file_name
      });

    if (signError) {
      console.error('Error creating signed URL:', signError);
      return { success: false, error: 'Failed to generate download link' };
    }

    return { 
      success: true, 
      url: signedUrl.signedUrl,
      fileName: purchase.digital_file.file_name
    };
  } catch (error) {
    console.error('Error in getSecureDownloadUrl:', error);
    return { success: false, error: error.message };
  }
}
