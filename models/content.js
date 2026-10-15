import mongoose from 'mongoose';

const { Schema } = mongoose;
const timestamps = { timestamps: true };

const teamMemberSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  role: { type: String, required: true, trim: true, maxlength: 120 },
  bio: { type: String, default: '', maxlength: 2000 },
  photoUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  whatsappUrl: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, timestamps);

const projectSchema = new Schema({
  title: { type: String, required: true, trim: true },
  tag: { type: String, required: true, trim: true },
  client: { type: String, default: '' },
  description: { type: String, default: '' },
  problem: { type: String, default: '' },
  solution: { type: String, default: '' },
  technologies: { type: [String], default: [] },
  tramoRole: { type: String, default: '' },
  results: { type: String, default: '' },
  coverImageUrl: { type: String, default: '' },
  screenshotUrls: { type: [String], default: [] },
  displayOrder: { type: Number, default: 0 },
  published: { type: Boolean, default: true },
}, timestamps);

const serviceSchema = new Schema({
  code: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  displayOrder: { type: Number, default: 0 },
}, timestamps);

const enquirySchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, default: '', trim: true, maxlength: 254 },
  phone: { type: String, default: '', trim: true, maxlength: 80 },
  company: { type: String, default: '', trim: true, maxlength: 160 },
  servicesNeeded: { type: [String], default: [] },
  message: { type: String, default: '', maxlength: 5000 },
  status: { type: String, enum: ['new', 'contacted', 'converted', 'closed'], default: 'new' },
}, timestamps);

const siteSettingsSchema = new Schema({
  contactEmail: { type: String, default: 'tramotechnologies@gmail.com' },
  contactPhone: { type: String, default: '+260 972 336 313' },
  address: { type: String, default: 'University of Zambia, Great East Road Campus, Lusaka' },
  defaultTheme: { type: String, enum: ['system', 'light', 'dark'], default: 'system' },
  linkedinUrl: { type: String, default: '' },
  facebookUrl: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  whatsappUrl: { type: String, default: '' },
}, timestamps);

const adminUserSchema = new Schema({
  email: { type: String, required: true, trim: true, lowercase: true, unique: true, maxlength: 254 },
  name: { type: String, default: '', trim: true, maxlength: 120 },
  passwordHash: { type: String, required: true },
  active: { type: Boolean, default: true },
}, timestamps);

export const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', teamMemberSchema);
export const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
export const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export const Enquiry = mongoose.models.Enquiry || mongoose.model('Enquiry', enquirySchema);
export const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', siteSettingsSchema);
export const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);