import * as React from 'react';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Product } from '../../hooks/useProducts';
import { formatPrice } from '../../utils/helpers';
import { CLOUD_NAME, UPLOAD_PRESET } from '../../cloudinary/config';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../../components/ui/sheet';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Edit, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Sports', 'Beauty', 'Books'];

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    stock: '',
    featured: false,
    imageUrls: [] as string[],
  });

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({ 
          id: doc.id, 
          ...data,
          imageUrls: data.imageUrls || [data.imageUrl].filter(Boolean)
        } as Product);
      });
      setProducts(productsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleOpenSheet = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
        category: product.category,
        stock: product.stock.toString(),
        featured: product.featured,
        imageUrls: product.imageUrls || [product.imageUrl].filter(Boolean),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', description: '', price: '', discountPrice: '', category: '', stock: '', featured: false, imageUrls: [],
      });
    }
    setIsSheetOpen(true);
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET || '');
    
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.secure_url) {
        return data.secure_url;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
    
    toast.promise(
      Promise.all(uploadPromises).then(urls => {
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...urls]
        }));
      }),
      {
        loading: 'Uploading images...',
        success: 'Images uploaded successfully',
        error: 'Failed to upload images',
      }
    );
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.imageUrls.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
        category: formData.category,
        stock: Number(formData.stock),
        featured: formData.featured,
        imageUrl: formData.imageUrls[0], // Primary image
        imageUrls: formData.imageUrls,
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), {
          ...productData,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        });
        toast.success('Product added successfully');
      }
      setIsSheetOpen(false);
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="p-12 bg-[#050505] min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Products</h1>
        <Button onClick={() => handleOpenSheet()} className="bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom px-8 h-12 font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-white/5">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      <div className="glass rounded-[40px] border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16 px-8">Product</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Category</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Price</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Stock</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16">Status</TableHead>
              <TableHead className="text-indigo-400 font-black uppercase tracking-widest text-[10px] h-16 text-right px-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-xs">Loading products...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow className="border-white/5">
                <TableCell colSpan={6} className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest text-xs">No products found</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={product.imageUrl} alt={product.name} className="w-14 h-14 rounded-2xl object-cover glass border border-white/5" />
                      <span className="font-black text-white uppercase tracking-tight line-clamp-1">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400 font-bold text-xs uppercase tracking-widest">{product.category}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-black text-white">{formatPrice(product.discountPrice || product.price)}</span>
                      {product.discountPrice && <span className="text-[10px] text-slate-600 line-through font-bold">{formatPrice(product.price)}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? 'default' : 'destructive'} className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${product.stock > 10 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {product.stock} Units
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.featured ? <Badge className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest">Featured</Badge> : <span className="text-slate-700 font-black text-[10px] uppercase tracking-widest ml-4">—</span>}
                  </TableCell>
                  <TableCell className="text-right px-8">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenSheet(product)} className="rounded-full hover:bg-white/10">
                        <Edit className="w-4 h-4 text-slate-400" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full hover:bg-red-500/10">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="glass border-white/10 rounded-[40px] p-10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-2xl font-black text-white uppercase tracking-tighter">Delete Product</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-400 font-medium">
                              Are you sure you want to delete "{product.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-8">
                            <AlertDialogCancel className="rounded-full-custom glass border-white/10 text-white font-black uppercase tracking-widest text-xs h-12 px-8">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-red-600 hover:bg-red-700 rounded-full-custom font-black uppercase tracking-widest text-xs h-12 px-8">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          className="w-[400px] sm:w-[540px] overflow-y-auto glass border-white/10 p-10"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <SheetHeader className="mb-10">
            <SheetTitle className="text-3xl font-black text-white uppercase tracking-tighter">{editingProduct ? 'Edit Product' : 'Add New Product'}</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Product Images</Label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {formData.imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square group">
                    <img src={url} alt={`Product ${index}`} className="w-full h-full rounded-2xl object-cover glass border border-white/5" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Primary</span>
                    )}
                  </div>
                ))}
                <label className="aspect-square rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 glass cursor-pointer hover:bg-white/5 transition-colors">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Add Image</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest ml-4">First image will be used as the primary thumbnail.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Product Name</Label>
              <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Description</Label>
              <textarea 
                id="description" 
                className="flex min-h-[120px] w-full rounded-[32px] border border-white/5 glass px-6 py-4 text-sm text-white placeholder:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Original Price (₹)</Label>
                <Input id="price" type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Discount Price (₹)</Label>
                <Input id="discountPrice" type="number" min="0" value={formData.discountPrice} onChange={e => setFormData({...formData, discountPrice: e.target.value})} className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})} required>
                  <SelectTrigger className="glass rounded-full-custom border-white/5 text-white h-14 px-6">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 text-white rounded-2xl">
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-indigo-400 ml-4">Stock Quantity</Label>
                <Input id="stock" type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} required className="glass rounded-full-custom border-white/5 text-white h-14 px-6" />
              </div>
            </div>

            <div className="flex items-center justify-between glass p-6 rounded-[32px] border-white/5">
              <div className="space-y-1">
                <Label htmlFor="featured" className="text-sm font-black text-white uppercase tracking-widest">Featured Product</Label>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Show on homepage</p>
              </div>
              <Switch id="featured" checked={formData.featured} onCheckedChange={v => setFormData({...formData, featured: v})} />
            </div>

            <Button type="submit" className="w-full h-16 bg-white text-black hover:bg-indigo-600 hover:text-white rounded-full-custom font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-white/5" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
};
