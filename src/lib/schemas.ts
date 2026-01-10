import { z } from 'zod';

// Tournament validation schema
export const tournamentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional().nullable(),
  start_date: z.string().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    'Invalid start date'
  ).optional().nullable(),
  end_date: z.string().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    'Invalid end date'
  ).optional().nullable(),
  status: z.enum(['upcoming', 'ongoing', 'completed']).optional().nullable(),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  max_teams: z.number().int().min(2, 'Minimum 2 teams').max(128, 'Maximum 128 teams').optional().nullable(),
  match_duration_minutes: z.number().int().min(10, 'Minimum 10 minutes').max(180, 'Maximum 180 minutes').optional().nullable(),
  half_time_duration_minutes: z.number().int().min(0).max(30).optional().nullable(),
  max_substitutions: z.number().int().min(0).max(12).optional().nullable(),
  age_category: z.string().max(50).optional().nullable(),
  format: z.enum(['league', 'knockout', 'group_knockout']).optional().nullable(),
}).refine(
  (data) => {
    if (!data.start_date || !data.end_date) return true;
    return new Date(data.start_date) <= new Date(data.end_date);
  },
  { message: 'End date must be after start date', path: ['end_date'] }
);

// Team validation schema
export const teamSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  short_name: z.string().max(10, 'Short name too long').optional().nullable(),
  coach: z.string().max(100).optional().nullable(),
  stadium: z.string().max(100).optional().nullable(),
  founded_year: z.number().int()
    .min(1800, 'Invalid year')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .optional().nullable(),
  wins: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  draws: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  losses: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  goals_for: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  goals_against: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  points: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  tournament_id: z.string().uuid().optional().nullable(),
});

// Player validation schema
export const playerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  position: z.string().max(50).optional().nullable(),
  jersey_number: z.number().int().min(1, 'Minimum 1').max(99, 'Maximum 99').optional().nullable(),
  team_id: z.string().uuid().optional().nullable(),
  nationality: z.string().max(100).optional().nullable(),
  date_of_birth: z.string().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    'Invalid date of birth'
  ).optional().nullable(),
  height: z.number().int().min(100, 'Minimum 100 cm').max(250, 'Maximum 250 cm').optional().nullable(),
  goals: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  assists: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  appearances: z.number().int().min(0, 'Cannot be negative').optional().nullable(),
  photo_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  bio: z.string().max(1000, 'Bio too long').optional().nullable(),
});

// Match validation schema
export const matchSchema = z.object({
  home_team_id: z.string().uuid('Invalid team').optional().nullable(),
  away_team_id: z.string().uuid('Invalid team').optional().nullable(),
  tournament_id: z.string().uuid('Invalid tournament').optional().nullable(),
  match_date: z.string().refine(
    (d) => !d || !isNaN(Date.parse(d)),
    'Invalid match date'
  ).optional().nullable(),
  venue: z.string().max(200, 'Venue name too long').optional().nullable(),
  status: z.enum(['scheduled', 'live', 'completed', 'postponed', 'cancelled']).optional().nullable(),
  home_score: z.number().int().min(0, 'Score cannot be negative').max(99, 'Score too high').optional().nullable(),
  away_score: z.number().int().min(0, 'Score cannot be negative').max(99, 'Score too high').optional().nullable(),
  referee_id: z.string().uuid().optional().nullable(),
  tagline: z.string().max(200).optional().nullable(),
}).refine(
  (data) => data.home_team_id !== data.away_team_id || (!data.home_team_id && !data.away_team_id),
  { message: 'Home and away teams cannot be the same', path: ['away_team_id'] }
);

// News validation schema
export const newsSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200, 'Title too long'),
  excerpt: z.string().max(500, 'Excerpt too long').optional().nullable(),
  content: z.string().max(50000, 'Content too long').optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  image_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  is_featured: z.boolean().optional().nullable(),
  tournament_id: z.string().uuid().optional().nullable(),
});

// Video validation schema  
export const videoSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  youtube_url: z.string().regex(
    /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/,
    'Invalid YouTube URL format'
  ),
  thumbnail_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  is_featured: z.boolean().optional().nullable(),
  tournament_id: z.string().uuid().optional().nullable(),
});

// Sponsor validation schema
export const sponsorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
  logo_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  website_url: z.string().url('Invalid URL').optional().or(z.literal('')).nullable(),
  type: z.enum(['partner', 'sponsor', 'supporter']).optional().nullable(),
  position: z.enum(['top', 'bottom', 'both']).optional().nullable(),
  display_order: z.number().int().min(0).max(1000).optional().nullable(),
  is_active: z.boolean().optional().nullable(),
});

// Helper function to validate and get errors
export function validateSchema<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: boolean; 
  data?: T; 
  errors?: Record<string, string>;
} {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (path && !errors[path]) {
      errors[path] = err.message;
    }
  });
  
  return { success: false, errors };
}
