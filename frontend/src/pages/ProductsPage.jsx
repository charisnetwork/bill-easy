import React, { useState, useEffect } from 'react';
import { productAPI, companyAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { InputGroup } from '../components/ui/input-group';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from '../components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '../components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, Filter, FileUp, Loader2, X, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../config/api';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
};
const ProductForm = ({ product, categories, onSave, fetchCategories, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    hsn_code: product?.hsn_code || '',
    category_id: product?.category_id || 'none',
    unit: product?.unit || 'pcs',
    gst_rate: product?.gst_rate || 18,
    purchase_price: product?.purchase_price || 0,
    sale_price: product?.sale_price || 0,
    stock_quantity: product?.stock_quantity || 0,
    low_stock_alert: product?.low_stock_alert || 10,
    barcode: product?.barcode || '',
    description: product?.description || '',
    type: product?.type || 'product',
    godown_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [godowns, setGodowns] = useState([]);
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [hsnQuery, setHsnQuery] = useState(formData.hsn_code || '');
  const [hsnResults, setHsnResults] = useState([]);
  const [hsnOpen, setHsnOpen] = useState(false);
  const hsnRef = React.useRef(null);

  // Common GST HSN codes reference list
  const HSN_LIST = [
    { code: '0101', desc: 'Live horses, asses, mules and hinnies' },
    { code: '0201', desc: 'Meat of bovine animals, fresh or chilled' },
    { code: '0301', desc: 'Live fish' },
    { code: '0401', desc: 'Milk and cream, not concentrated' },
    { code: '0601', desc: 'Bulbs, tubers, roots – live plants' },
    { code: '0701', desc: 'Potatoes, fresh or chilled' },
    { code: '0702', desc: 'Tomatoes, fresh or chilled' },
    { code: '0703', desc: 'Onions, shallots, garlic, leeks' },
    { code: '0901', desc: 'Coffee' },
    { code: '0902', desc: 'Tea' },
    { code: '1001', desc: 'Wheat and meslin' },
    { code: '1006', desc: 'Rice' },
    { code: '1101', desc: 'Wheat or meslin flour' },
    { code: '1501', desc: 'Pig fat (lard)' },
    { code: '1701', desc: 'Cane or beet sugar, sucrose' },
    { code: '1801', desc: 'Cocoa beans, whole or broken' },
    { code: '1901', desc: 'Malt extract, food preparations of flour' },
    { code: '2101', desc: 'Extracts, essences and concentrates of coffee, tea or maté' },
    { code: '2201', desc: 'Waters, including natural or artificial mineral waters' },
    { code: '2202', desc: 'Waters, including mineral and aerated, with added sugar' },
    { code: '2301', desc: 'Flours, meals and pellets of meat or meat offal' },
    { code: '2401', desc: 'Unmanufactured tobacco' },
    { code: '2501', desc: 'Salt and pure sodium chloride' },
    { code: '2601', desc: 'Iron ores and concentrates' },
    { code: '2701', desc: 'Coal; briquettes, ovoids and similar solid fuels' },
    { code: '2710', desc: 'Petroleum oils and oils from bituminous minerals' },
    { code: '2711', desc: 'Petroleum gas and other gaseous hydrocarbons' },
    { code: '2801', desc: 'Fluorine, chlorine, bromine and iodine' },
    { code: '2901', desc: 'Acyclic hydrocarbons' },
    { code: '3001', desc: 'Glands and other organs for therapeutic uses' },
    { code: '3002', desc: 'Human blood, vaccines, toxins, cultures' },
    { code: '3003', desc: 'Medicaments (mixed or unmixed products) for therapeutic use' },
    { code: '3004', desc: 'Medicaments in measured doses for retail sale' },
    { code: '3101', desc: 'Animal or vegetable fertilisers' },
    { code: '3201', desc: 'Tanning extracts of vegetable origin' },
    { code: '3301', desc: 'Essential oils (terpeneless or not)' },
    { code: '3401', desc: 'Soap, organic surface-active products for use as soap' },
    { code: '3402', desc: 'Organic surface-active agents (detergents)' },
    { code: '3501', desc: 'Caseins, caseinates and other casein derivatives' },
    { code: '3601', desc: 'Propellant powders' },
    { code: '3701', desc: 'Photographic plates and film in the flat, sensitised' },
    { code: '3801', desc: 'Artificial graphite' },
    { code: '3901', desc: 'Polymers of ethylene, in primary forms' },
    { code: '3902', desc: 'Polymers of propylene, in primary forms' },
    { code: '3903', desc: 'Polymers of styrene, in primary forms' },
    { code: '3904', desc: 'Polymers of vinyl chloride (PVC), in primary forms' },
    { code: '3919', desc: 'Self-adhesive plates, sheets, film of plastics' },
    { code: '3920', desc: 'Plastic plates, sheets, film, foil and strip' },
    { code: '3923', desc: 'Articles for conveyance/packing of goods, of plastics' },
    { code: '4001', desc: 'Natural rubber, balata, gutta-percha' },
    { code: '4011', desc: 'New pneumatic tyres, of rubber' },
    { code: '4016', desc: 'Other articles of vulcanised rubber' },
    { code: '4101', desc: 'Raw hides and skins of bovine or equine animals' },
    { code: '4201', desc: 'Saddlery and harness for any animal' },
    { code: '4301', desc: 'Raw furskins' },
    { code: '4401', desc: 'Fuel wood' },
    { code: '4412', desc: 'Plywood, veneered panels and similar laminated wood' },
    { code: '4421', desc: 'Other articles of wood' },
    { code: '4501', desc: 'Natural cork, raw or simply prepared' },
    { code: '4601', desc: 'Plaiting materials; basket-ware, wickerwork' },
    { code: '4701', desc: 'Mechanical wood pulp' },
    { code: '4801', desc: 'Newsprint, in rolls or sheets' },
    { code: '4802', desc: 'Uncoated paper and paperboard, writing/printing' },
    { code: '4817', desc: 'Envelopes, letter cards, plain postcards and correspondence' },
    { code: '4901', desc: 'Printed books, brochures, leaflets' },
    { code: '4902', desc: 'Newspapers, journals and periodicals' },
    { code: '5001', desc: 'Silkworm cocoons suitable for reeling' },
    { code: '5101', desc: 'Wool, not carded or combed' },
    { code: '5201', desc: 'Cotton, not carded or combed' },
    { code: '5208', desc: 'Woven fabrics of cotton' },
    { code: '5401', desc: 'Sewing thread of man-made filaments' },
    { code: '5501', desc: 'Synthetic filament tow' },
    { code: '5601', desc: 'Wadding of textile materials' },
    { code: '5701', desc: 'Carpets and other textile floor coverings, knotted' },
    { code: '5801', desc: 'Woven pile fabrics and chenille fabrics' },
    { code: '5901', desc: 'Textile fabrics coated with gum or amylaceous substances' },
    { code: '6001', desc: 'Pile fabrics, including long pile fabrics and terry fabrics' },
    { code: '6101', desc: "Men's overcoats, car coats, cloaks and similar articles" },
    { code: '6109', desc: 'T-shirts, singlets and other vests – knitted' },
    { code: '6110', desc: 'Jerseys, pullovers, sweatshirts – knitted' },
    { code: '6201', desc: "Men's overcoats, anoraks, wind-jackets" },
    { code: '6301', desc: 'Blankets and travelling rugs' },
    { code: '6401', desc: 'Waterproof footwear with outer soles' },
    { code: '6501', desc: 'Hat-forms, hat bodies and hoods of felt' },
    { code: '6601', desc: 'Umbrellas and sun umbrellas' },
    { code: '6701', desc: 'Skins and other parts of birds with feathers' },
    { code: '6801', desc: 'Setts, curbstones and flagstones, of natural stone' },
    { code: '6901', desc: 'Bricks, blocks, tiles – non-refractory ceramic' },
    { code: '6910', desc: 'Ceramic sinks, wash basins, baths, bidets, WC pans' },
    { code: '7001', desc: 'Cullet and other waste and scrap of glass' },
    { code: '7013', desc: 'Glassware for table, kitchen, toilet, office, indoor' },
    { code: '7101', desc: 'Pearls, natural or cultured, whether or not worked' },
    { code: '7108', desc: 'Gold (including gold plated with platinum)' },
    { code: '7113', desc: 'Articles of jewellery and parts thereof' },
    { code: '7201', desc: 'Pig iron and spiegeleisen in pigs, blocks or other forms' },
    { code: '7210', desc: 'Flat-rolled products of iron or non-alloy steel' },
    { code: '7214', desc: 'Other bars and rods of iron or non-alloy steel' },
    { code: '7216', desc: 'Angles, shapes and sections of iron or non-alloy steel' },
    { code: '7301', desc: 'Sheet piling of iron or steel' },
    { code: '7401', desc: 'Copper mattes; cement copper' },
    { code: '7501', desc: 'Nickel mattes, nickel oxide sinters' },
    { code: '7601', desc: 'Unwrought aluminium' },
    { code: '7610', desc: 'Aluminium structures and parts; plates, rods, profiles' },
    { code: '7701', desc: 'Unwrought lead' },
    { code: '7801', desc: 'Unwrought lead' },
    { code: '7901', desc: 'Unwrought zinc' },
    { code: '8001', desc: 'Unwrought tin' },
    { code: '8101', desc: 'Tungsten (wolfram) and articles thereof' },
    { code: '8201', desc: 'Hand tools: spades, shovels, mattocks, picks, hoes' },
    { code: '8202', desc: 'Hand saws; blades for saws of all kinds' },
    { code: '8301', desc: 'Padlocks and locks of base metal' },
    { code: '8401', desc: 'Nuclear reactors; fuel elements for nuclear reactors' },
    { code: '8408', desc: 'Compression-ignition internal combustion piston engines (diesel)' },
    { code: '8409', desc: 'Parts for internal combustion piston engines' },
    { code: '8414', desc: 'Air or vacuum pumps, air or other gas compressors and fans' },
    { code: '8415', desc: 'Air conditioning machines' },
    { code: '8418', desc: 'Refrigerators, freezers and other refrigerating/freezing equipment' },
    { code: '8419', desc: 'Machinery for treating materials by heating/cooling' },
    { code: '8422', desc: 'Dishwashing machines; machinery for filling, sealing, labelling' },
    { code: '8428', desc: 'Other lifting, handling, loading or unloading machinery' },
    { code: '8443', desc: 'Printing machinery; ink-jet printing machines' },
    { code: '8450', desc: 'Household- or laundry-type washing machines' },
    { code: '8451', desc: 'Machinery for washing, cleaning, drying textiles' },
    { code: '8471', desc: 'Automatic data-processing machines (computers)' },
    { code: '8473', desc: 'Parts and accessories for computers' },
    { code: '8481', desc: 'Taps, cocks, valves and similar appliances for pipes' },
    { code: '8501', desc: 'Electric motors and generators' },
    { code: '8502', desc: 'Electric generating sets and rotary converters' },
    { code: '8504', desc: 'Electrical transformers, static converters and inductors' },
    { code: '8507', desc: 'Electric accumulators (batteries)' },
    { code: '8516', desc: 'Electric instantaneous or storage water heaters, irons' },
    { code: '8517', desc: 'Telephone sets; smartphones and other phones' },
    { code: '8518', desc: 'Microphones, loudspeakers, headphones, amplifiers' },
    { code: '8519', desc: 'Sound recording or reproducing apparatus' },
    { code: '8521', desc: 'Video recording or reproducing apparatus' },
    { code: '8523', desc: 'Discs, tapes, solid-state storage devices for recording' },
    { code: '8525', desc: 'Transmission apparatus for radio-broadcasting/TV, cameras' },
    { code: '8528', desc: 'Monitors and projectors; TV receivers' },
    { code: '8536', desc: 'Electrical apparatus for switching, protecting circuits' },
    { code: '8544', desc: 'Insulated wire, cable and other insulated electric conductors' },
    { code: '8601', desc: 'Rail locomotives powered from an external source of electricity' },
    { code: '8701', desc: 'Tractors' },
    { code: '8702', desc: 'Motor vehicles for transport of ten or more persons' },
    { code: '8703', desc: 'Motor cars and other motor vehicles for transport of persons' },
    { code: '8704', desc: 'Motor vehicles for transport of goods' },
    { code: '8711', desc: 'Motorcycles (including mopeds) and cycles with auxiliary motor' },
    { code: '8714', desc: 'Parts and accessories of vehicles' },
    { code: '8716', desc: 'Trailers and semi-trailers; other vehicles, not mechanically propelled' },
    { code: '8801', desc: 'Balloons and dirigibles; gliders, hang gliders' },
    { code: '8901', desc: 'Cruise ships, excursion boats, ferries, cargo ships' },
    { code: '9001', desc: 'Optical fibres and optical fibre bundles' },
    { code: '9006', desc: 'Photographic cameras' },
    { code: '9018', desc: 'Instruments and appliances for medical, surgical use' },
    { code: '9021', desc: 'Orthopaedic appliances, splints, artificial parts of the body' },
    { code: '9101', desc: 'Wrist watches, pocket watches and other watches' },
    { code: '9201', desc: 'Pianos; keyboard pipe organs' },
    { code: '9301', desc: 'Military weapons (other than revolvers, pistols)' },
    { code: '9401', desc: 'Seats (other than those of heading 9402)' },
    { code: '9403', desc: 'Other furniture and parts thereof' },
    { code: '9404', desc: 'Mattress supports; mattresses, sleeping bags' },
    { code: '9405', desc: 'Lamps and lighting fittings; illuminated signs, nameplates' },
    { code: '9406', desc: 'Prefabricated buildings' },
    { code: '9501', desc: 'Wheeled toys designed to be ridden; dolls\' carriages' },
    { code: '9503', desc: 'Tricycles, scooters, toy sets, other toys' },
    { code: '9504', desc: 'Video games consoles and machines, games' },
    { code: '9601', desc: 'Worked ivory, bone, tortoise-shell' },
    { code: '9701', desc: 'Paintings, drawings and pastels' },
    { code: '9801', desc: 'Project imports; laboratory chemicals' },
    { code: '9802', desc: 'Software on media' },
    { code: '9803', desc: 'Passenger baggage' },
    { code: '9804', desc: 'Postal imports' },
    { code: '9805', desc: 'Personal imports by Indian residents from abroad' },
    { code: '9901', desc: 'Services by a hotel, inn, guest house' },
    { code: '9954', desc: 'Construction services' },
    { code: '9961', desc: 'Services in wholesale trade' },
    { code: '9962', desc: 'Services in retail trade' },
    { code: '9971', desc: 'Financial and related services' },
    { code: '9972', desc: 'Real estate services' },
    { code: '9973', desc: 'Leasing or rental services without operator' },
    { code: '9981', desc: 'Research and development services' },
    { code: '9982', desc: 'Legal and accounting services' },
    { code: '9983', desc: 'Management consulting and other professional services' },
    { code: '9984', desc: 'Telecommunications, broadcasting and information supply services' },
    { code: '9985', desc: 'Support services' },
    { code: '9986', desc: 'Agriculture, forestry, fishing and related support services' },
    { code: '9987', desc: 'Maintenance, repair and installation services' },
    { code: '9988', desc: 'Manufacturing services on physical inputs owned by others' },
    { code: '9989', desc: 'Other manufacturing services' },
    { code: '9991', desc: 'Public administration and other government services' },
    { code: '9992', desc: 'Education services' },
    { code: '9993', desc: 'Human health and social care services' },
    { code: '9994', desc: 'Sewage and waste collection, disposal and other environmental services' },
    { code: '9995', desc: 'Services of membership organisations' },
    { code: '9996', desc: 'Recreational, cultural and sporting services' },
    { code: '9997', desc: 'Other services' },
    { code: '9998', desc: 'Domestic services' },
    { code: '9999', desc: 'Services provided by extraterritorial organizations' },
  ];

  const searchHsn = (query) => {
    setHsnQuery(query);
    setFormData(prev => ({ ...prev, hsn_code: query }));
    if (query.length < 2) { setHsnResults([]); setHsnOpen(false); return; }
    const q = query.toLowerCase();
    const matches = HSN_LIST.filter(h =>
      h.code.startsWith(q) || h.desc.toLowerCase().includes(q)
    ).slice(0, 8);
    setHsnResults(matches);
    setHsnOpen(matches.length > 0);
  };

  const selectHsn = (item) => {
    setHsnQuery(item.code);
    setFormData(prev => ({ ...prev, hsn_code: item.code }));
    setHsnOpen(false);
    setHsnResults([]);
  };

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleOutside = (e) => { if (hsnRef.current && !hsnRef.current.contains(e.target)) setHsnOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        const res = await companyAPI.getGodowns();
        setGodowns(res.data);
        if (res.data.length > 0 && !product?.id) {
          const def = res.data.find(g => g.is_default);
          setFormData(prev => ({ ...prev, godown_id: def ? def.id : res.data[0].id }));
        }
      } catch (e) {}
    };
    fetchGodowns();
  }, [product]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    setCreatingCategory(true);
    try {
      const res = await productAPI.createCategory({ name: newCategoryName });
      toast.success('Category created');
      await fetchCategories();
      setFormData(prev => ({ ...prev, category_id: res.data.category.id }));
      setNewCategoryDialogOpen(false);
      setNewCategoryName('');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create category'));
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCategoryChange = (value) => {
    if (value === 'add_new') {
      setNewCategoryDialogOpen(true);
    } else {
      setFormData({ ...formData, category_id: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        gst_rate: parseFloat(formData.gst_rate),
        purchase_price: parseFloat(formData.purchase_price),
        sale_price: parseFloat(formData.sale_price),
        stock_quantity: parseFloat(formData.stock_quantity),
        low_stock_alert: parseFloat(formData.low_stock_alert)
      };
      if (product?.id) {
        await productAPI.update(product.id, data);
        toast.success('Product updated');
      } else {
        await productAPI.create(data);
        toast.success('Product created');
      }
      onSave();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Operation failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto pr-2">
      <div className="form-grid">
        <div className="form-field form-field-full">
          <Label className="form-label">Product Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            data-testid="product-name-input"
          />
        </div>
        <div className="form-field">
          <Label className="form-label">SKU</Label>
          <Input
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            data-testid="product-sku-input"
          />
        </div>
        <div className="form-field" ref={hsnRef} style={{ position: 'relative' }}>
          <Label className="form-label">HSN Code</Label>
          <div className="flex gap-1.5 items-center">
            <div className="relative flex-1">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <Input
                value={hsnQuery}
                onChange={(e) => searchHsn(e.target.value)}
                onFocus={() => hsnQuery.length >= 2 && hsnResults.length > 0 && setHsnOpen(true)}
                placeholder="Code or keyword…"
                className="pl-7"
                data-testid="product-hsn-input"
                autoComplete="off"
              />
            </div>
          </div>
          {hsnOpen && hsnResults.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                zIndex: 50,
                marginTop: '4px',
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                maxHeight: '220px',
                overflowY: 'auto',
              }}
            >
              <div style={{ padding: '6px 10px 4px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9' }}>
                HSN Suggestions
              </div>
              {hsnResults.map((item) => (
                <div
                  key={item.code}
                  onClick={() => selectHsn(item)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    borderBottom: '1px solid #f8fafc',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '13px',
                    color: '#4f46e5',
                    background: '#eef2ff',
                    borderRadius: '4px',
                    padding: '1px 6px',
                    minWidth: '44px',
                    textAlign: 'center',
                  }}>{item.code}</span>
                  <span style={{ fontSize: '12px', color: '#475569', flex: 1, lineHeight: 1.3 }}>{item.desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="form-field">
          <Label className="form-label">Category</Label>
          <Select
            value={formData.category_id}
            onValueChange={handleCategoryChange}
          >
          <SelectTrigger data-testid="product-category-select">
             <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent>
             <SelectItem value="none">No Category</SelectItem>
             {categories.map((cat) => (
             <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
             </SelectItem>
            ))}
            <div className="h-px bg-slate-100 my-1" />
            <SelectItem value="add_new" className="text-indigo-600 font-bold">
              + Add New Category
            </SelectItem>
         </SelectContent>
         </Select>
        </div>

        {/* New Category Dialog */}
        <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Electronics, Raw Materials"
                  autoFocus
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setNewCategoryDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingCategory}>
                  {creatingCategory ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Category
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <div className="space-y-2">
          <Label>Unit</Label>
          <Select
            value={formData.unit}
            onValueChange={(value) => setFormData({ ...formData, unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pcs">Pieces</SelectItem>
              <SelectItem value="kg">Kilograms</SelectItem>
              <SelectItem value="g">Grams</SelectItem>
              <SelectItem value="l">Liters</SelectItem>
              <SelectItem value="ml">Milliliters</SelectItem>
              <SelectItem value="m">Meters</SelectItem>
              <SelectItem value="box">Box</SelectItem>
              <SelectItem value="dozen">Dozen</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="form-field">
          <Label className="form-label">GST Rate (%)</Label>
          <Select
            value={String(formData.gst_rate)}
            onValueChange={(value) => setFormData({ ...formData, gst_rate: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0%</SelectItem>
              <SelectItem value="5">5%</SelectItem>
              <SelectItem value="12">12%</SelectItem>
              <SelectItem value="18">18%</SelectItem>
              <SelectItem value="28">28%</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {!product?.id && (
          <div className="form-field">
            <Label className="form-label">Initial Godown</Label>
            <Select
              value={formData.godown_id}
              onValueChange={(value) => setFormData({ ...formData, godown_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Godown" />
              </SelectTrigger>
              <SelectContent>
                {godowns.map((g) => (
                  <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="form-field">
          <Label className="form-label">Barcode</Label>
          <Input
            value={formData.barcode}
            onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
          />
        </div>
        <div className="form-field">
          <Label className="form-label">Purchase Price *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.purchase_price}
            onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
            required
            data-testid="product-purchase-price-input"
          />
        </div>
        <div className="form-field">
          <Label className="form-label">Sale Price *</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.sale_price}
            onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
            required
            data-testid="product-sale-price-input"
          />
        </div>
        {!product?.id && (
          <div className="form-field">
            <Label className="form-label">Opening Stock</Label>
            <Input
              type="number"
              step="0.01"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
              data-testid="product-stock-input"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>Low Stock Alert</Label>
          <Input
            type="number"
            step="0.01"
            value={formData.low_stock_alert}
            onChange={(e) => setFormData({ ...formData, low_stock_alert: e.target.value })}
          />
        </div>
      </div>
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={loading} data-testid="save-product-btn">
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showLowStock, setShowLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll({ search, page, limit: 20, low_stock: showLowStock });
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load products'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productAPI.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search, page, showLowStock]);

  // Clear selection when products change (page change, search, etc.)
  useEffect(() => {
    setSelectedIds(new Set());
  }, [products]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Delete failed'));
    }
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${count} selected product(s)? This action cannot be undone.`)) return;

    setBulkDeleting(true);
    try {
      const res = await productAPI.bulkDelete(Array.from(selectedIds));
      toast.success(res.data.message || `${count} product(s) deleted`);
      setSelectedIds(new Set());
      fetchProducts();
    } catch (error) {
      toast.error(getErrorMessage(error, 'Bulk delete failed'));
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleSave = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
    fetchProducts();
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setImporting(true);
    try {
      const res = await productAPI.importProducts(formData);
      toast.success(res.data.message);
      if (res.data.skipped > 0) {
        toast.info(`${res.data.skipped} duplicate items were skipped.`);
      }
      fetchProducts();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Import failed');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const isLowStock = (product) => {
    return parseFloat(product.stock_quantity) <= parseFloat(product.low_stock_alert);
  };

  // Selection helpers
  const toggleSelectOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const isAllSelected = products.length > 0 && selectedIds.size === products.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < products.length;
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="space-y-6 animate-fade-in" data-testid="products-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-600">Manage your inventory</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="file"
              id="import-items"
              className="hidden"
              accept=".xlsx, .xls, .csv"
              onChange={handleImport}
              disabled={importing}
            />
            <Button 
              variant="outline"
              disabled={importing}
              onClick={() => document.getElementById('import-items').click()}
            >
              {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
              Import
            </Button>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => setSelectedProduct(null)}
              data-testid="add-product-btn"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
            </DialogHeader>
            <ProductForm
              product={selectedProduct}
              categories={categories}
              onSave={handleSave}
              fetchCategories={fetchCategories}
              onClose={() => setDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>

    {/* Bulk Action Toolbar */}
    {hasSelection && (
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 animate-fade-in">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-semibold text-sm px-3 py-1">
            {selectedIds.size} selected
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds(new Set())}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size === 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const product = products.find(p => p.id === Array.from(selectedIds)[0]);
                if (product) handleEdit(product);
              }}
              className="text-indigo-600 border-indigo-300 hover:bg-indigo-50"
              data-testid="bulk-edit-btn"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            data-testid="bulk-delete-btn"
          >
            {bulkDeleting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Trash2 className="w-4 h-4 mr-1" />}
            Delete {selectedIds.size > 1 ? `(${selectedIds.size})` : ''}
          </Button>
        </div>
      </div>
    )}

    <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 max-w-sm">
              <InputGroup
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
                data-testid="search-products"
              />
            </div>
            <Button
              variant={showLowStock ? 'default' : 'outline'}
              onClick={() => setShowLowStock(!showLowStock)}
              className={showLowStock ? 'bg-amber-500 hover:bg-amber-600' : ''}
              data-testid="filter-low-stock"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Low Stock
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No products found</p>
              <p className="text-sm text-slate-500">Add your first product to get started</p>
            </div>
          ) : (
            <Table className="data-table">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 pl-4">
                    <Checkbox
                      checked={isAllSelected}
                      ref={(el) => {
                        if (el) el.dataset.state = isSomeSelected ? 'indeterminate' : (isAllSelected ? 'checked' : 'unchecked');
                      }}
                      onCheckedChange={toggleSelectAll}
                      aria-label="Select all products"
                      data-testid="select-all-checkbox"
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Purchase Price</TableHead>
                  <TableHead className="text-right">Sale Price</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-center">GST</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow
                    key={product.id}
                    data-testid={`product-row-${product.id}`}
                    className={selectedIds.has(product.id) ? 'bg-indigo-50/60' : ''}
                  >
                    <TableCell className="pl-4">
                      <Checkbox
                        checked={selectedIds.has(product.id)}
                        onCheckedChange={() => toggleSelectOne(product.id)}
                        aria-label={`Select ${product.name}`}
                        data-testid={`select-product-${product.id}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-900">{product.name}</div>
                      {product.sku && (
                        <div className="text-xs text-slate-500">SKU: {product.sku}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {product.Category?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatCurrency(product.purchase_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {formatCurrency(product.sale_price)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isLowStock(product) && (
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                        )}
                        <span className={`font-mono ${isLowStock(product) ? 'text-amber-600' : 'text-slate-900'}`}>
                          {product.stock_quantity} {product.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{product.gst_rate}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(product)}
                          data-testid={`edit-product-${product.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          data-testid={`delete-product-${product.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-slate-600">Page {page} of {totalPages}</span>
          <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
