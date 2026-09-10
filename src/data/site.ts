import rawSettings from './site.json';

export interface SiteLink {
  label: string;
  url: string;
}

export interface NavigationItem {
  key: string;
  zh: string;
  en: string;
}

export interface SiteSettings {
  siteName: string;
  name: string;
  nameEn: string;
  title: string;
  titleEn: string;
  bio: string;
  bioEn: string;
  description: string;
  descriptionEn: string;
  email: string;
  location: string;
  institution: string;
  institutionEn: string;
  avatar: string;
  cv: string;
  github: string;
  googleScholar: string;
  orcid: string;
  linkedin: string;
  otherLinks: SiteLink[];
  researchInterests: string[];
  navigation: NavigationItem[];
  socialLinks: SiteLink[];
  defaultLocale: 'zh' | 'en';
  theme: 'system' | 'light' | 'dark';
  deployment: {
    siteUrl: string;
    basePath: string;
  };
  features: {
    comments: boolean;
    liveChat: boolean;
    search: boolean;
  };
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
    lang: string;
  };
  tawk: {
    propertyId: string;
    widgetId: string;
  };
}

// Pages CMS omits optional empty fields when it serializes JSON. Normalize them
// here so an ordinary CMS save can never make the static build fail.
const raw = rawSettings as unknown as Partial<SiteSettings>;

const site: SiteSettings = {
  siteName: raw.siteName ?? 'Your Name — Academic Profile',
  name: raw.name ?? 'Your Name',
  nameEn: raw.nameEn ?? 'Your Name',
  title: raw.title ?? '',
  titleEn: raw.titleEn ?? '',
  bio: raw.bio ?? '',
  bioEn: raw.bioEn ?? '',
  description: raw.description ?? '',
  descriptionEn: raw.descriptionEn ?? '',
  email: raw.email ?? '',
  location: raw.location ?? '',
  institution: raw.institution ?? '',
  institutionEn: raw.institutionEn ?? '',
  avatar: raw.avatar ?? '/uploads/profile-placeholder.svg',
  cv: raw.cv ?? '',
  github: raw.github ?? '',
  googleScholar: raw.googleScholar ?? '',
  orcid: raw.orcid ?? '',
  linkedin: raw.linkedin ?? '',
  otherLinks: raw.otherLinks ?? [],
  researchInterests: raw.researchInterests ?? [],
  navigation: raw.navigation ?? [],
  socialLinks: raw.socialLinks ?? [],
  defaultLocale: raw.defaultLocale ?? 'zh',
  theme: raw.theme ?? 'system',
  deployment: {
    siteUrl: raw.deployment?.siteUrl ?? '',
    basePath: raw.deployment?.basePath ?? ''
  },
  features: {
    comments: raw.features?.comments ?? false,
    liveChat: raw.features?.liveChat ?? false,
    search: raw.features?.search ?? true
  },
  giscus: {
    repo: raw.giscus?.repo ?? '',
    repoId: raw.giscus?.repoId ?? '',
    category: raw.giscus?.category ?? 'Announcements',
    categoryId: raw.giscus?.categoryId ?? '',
    mapping: raw.giscus?.mapping ?? 'pathname',
    lang: raw.giscus?.lang ?? 'zh-CN'
  },
  tawk: {
    propertyId: raw.tawk?.propertyId ?? '',
    widgetId: raw.tawk?.widgetId ?? ''
  }
};

export default site;
