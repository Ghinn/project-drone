export type AppRole = 'guest' | 'pengusaha' | 'admin';

export type SppgItem = {
  id: string;
  name: string;
  location: string;
  menuVariations: number;
  rating: number;
  managedBy: string;
  gradientClass: string;
};

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  date: string;
  status: 'Draft' | 'Published';
};

export type TelemetryPoint = {
  time: string;
  ammonia: number;
  hydrogenSulfide: number;
  temperature: number;
  humidity: number;
  freshness: number;
};