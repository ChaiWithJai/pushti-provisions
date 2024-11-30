import { Category } from '../types';

export const wellnessDictionary: Category = {
  title: "Food & Wellness Dictionary",
  subtitle: "Understanding each element's purpose",
  sections: [
    {
      title: "Core Grains",
      content: {
        bajra: {
          benefits: [
            "High protein (11g/100g)",
            "Low glycemic impact",
            "Anti-inflammatory properties",
            "Better than wheat for joints",
            "Natural cooling properties"
          ],
          preparation: [
            "Fresh grinding preferred",
            "Use within 2-3 days",
            "Make thin rotli",
            "Never refrigerate"
          ],
          serving: [
            "2 small rotli (6-inch)",
            "OR 1/3 cup flour per meal"
          ]
        },
        jowar: {
          benefits: [
            "Rich in fiber",
            "Good for gut health",
            "Supports blood sugar balance",
            "Contains essential minerals"
          ],
          preparation: [
            "Soak briefly before grinding",
            "Mix with bajra for easier rolling",
            "Keep dough soft"
          ],
          serving: [
            "1-2 medium rotli",
            "OR 1/4 cup flour per meal"
          ]
        }
      }
    },
    {
      title: "Essential Proteins",
      content: {
        mung: {
          benefits: [
            "Easiest to digest",
            "Lowest inflammatory response",
            "Complete protein profile",
            "Quick cooking",
            "Multiple preparations"
          ],
          forms: {
            whole: [
              "Best sprouted",
              "Morning protein",
              "Highest nutrition"
            ],
            split: [
              "Quick cooking",
              "Light dal",
              "Evening meals"
            ]
          },
          preparation: {
            sprouting: [
              "Soak 8 hours",
              "Drain completely",
              "12-24 hour sprout",
              "Use immediately"
            ],
            cooking: [
              "Light masala only",
              "Add ginger always",
              "Fresh turmeric needed"
            ]
          }
        }
      }
    },
    {
      title: "Primary Vegetables",
      content: {
        bottleGourd: {
          benefits: [
            "Cooling property",
            "Easy digestion",
            "Natural anti-inflammatory",
            "Good for joints",
            "Versatile use"
          ],
          preparation: [
            "Fresh cut only",
            "Use within 24 hours",
            "Light cooking",
            "Minimal spice"
          ],
          serving: [
            "1 cup cooked",
            "2-3 times weekly"
          ]
        },
        ridgeGourd: {
          benefits: [
            "Low calorie",
            "High fiber",
            "Anti-inflammatory",
            "Good for digestion",
            "Natural cooling"
          ],
          preparation: [
            "Use fresh only",
            "Light scraping",
            "Quick cooking",
            "Minimal spice"
          ],
          serving: [
            "1 cup cooked",
            "Alternate with dudhi"
          ]
        }
      }
    },
    {
      title: "Essential Spices",
      content: {
        freshTurmeric: {
          benefits: [
            "Higher curcumin",
            "Better absorption",
            "More active compounds",
            "Gentler on stomach"
          ],
          usage: [
            "1-inch fresh daily",
            "Add black pepper",
            "Use with fat source",
            "Add end of cooking"
          ]
        },
        freshGinger: {
          benefits: [
            "Active compounds intact",
            "Better absorption",
            "Stronger effect",
            "Multiple benefits"
          ],
          usage: [
            "1-inch piece daily",
            "Morning water",
            "Every dal/vegetable",
            "Tea permitted"
          ]
        },
        blackPepper: {
          benefits: [
            "Enhances turmeric",
            "Aids absorption",
            "Natural warmth",
            "Digestive aid"
          ],
          usage: [
            "Small pinch only",
            "Fresh ground best",
            "With turmeric always"
          ]
        }
      }
    }
  ]
};