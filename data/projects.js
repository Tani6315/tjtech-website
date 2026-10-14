/* TJ Tech portfolio data — managed from the admin dashboard (/admin). */
window.TJ_PROJECTS = [
  {
    "id": "jahangir-motors",
    "title": "Jahangir Motors",
    "kind": "Motorcycle Dealership Website & Used-Bike Marketplace",
    "type": "website",
    "source": "real",
    "status": "live",
    "featured": true,
    "confidential": false,
    "url": "https://jahangirmotors.com",
    "repo": "",
    "summary": "Website and marketplace for a Honda & United motorcycle dealer in Vehari, Pakistan. New-bike pages with live pricing, an installment calculator and an OLX-style used-bike marketplace where customers post ads with photos from their phone camera. An admin panel lets the team moderate ads, reviews and users. It runs on Cloudflare Workers and D1.",
    "client": "Jahangir Motors is a motorcycle dealership in Adda Pipli, Vehari. It sells new Honda and United bikes on cash and installments, buys and sells used bikes, and handles bike registration, ownership transfer, biometric verification, e-challan and token tax for customers.",
    "goals": [
      "Give the dealership a professional online presence that ranks in local Google searches.",
      "Let customers check bike prices and work out installment plans before visiting.",
      "Build a used-bike marketplace where people can sell their own bikes, without fake ads and scams taking over."
    ],
    "result": "The dealership now has one website for its sales and services, where customers can check prices and installment plans before visiting, sell their used bikes, and get help with documentation. It runs on Cloudflare's free tier, so hosting costs nothing.",
    "tech": [
      "HTML",
      "CSS",
      "JavaScript",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Google & Facebook OAuth",
      "Cloudflare Turnstile",
      "Node.js"
    ],
    "tags": [
      "Marketplace",
      "Authentication",
      "Cloudflare Workers",
      "D1 (SQLite)",
      "SEO",
      "Responsive"
    ],
    "images": [
      {
        "src": "assets/projects/jahangir-motors/home.webp",
        "caption": "Home page: trusted motorcycle dealer in Vehari"
      }
    ],
    "features": [
      {
        "title": "New bikes and pricing",
        "items": [
          "Its own page for each of 12 models, with specifications, colour options and the on-road price.",
          "Prices are kept in one data file. Changing it updates every page, with no rebuild.",
          "Separate brand pages for Honda and United, with comparison tables."
        ]
      },
      {
        "title": "Installment calculator",
        "items": [
          "Works for new or used bikes, with a choice of advance payment and plans of 3, 6, 12 or 18 months.",
          "New bikes also offer urgent delivery or booking.",
          "Shows the monthly installment and total payable right away."
        ]
      },
      {
        "title": "Used-bike marketplace",
        "items": [
          "A short ad-posting form that starts with photos: take up to 8 photos in a row with an in-page camera, or pick several from the gallery.",
          "Photos are compressed on the phone before upload, so slow connections are fine.",
          "Ads go live as soon as they are posted.",
          "Search and filters by make, city, price, model year, engine size, condition and mileage.",
          "Each ad page shows the seller's number only after a tap, with call and WhatsApp buttons.",
          "Sellers manage their ads themselves: change the price, mark as sold, re-list or delete.",
          "Shared ad links show the bike's photo, title and price in WhatsApp and Facebook previews (server-rendered)."
        ]
      },
      {
        "title": "Customer accounts",
        "items": [
          "Sign-up with live validation: names in letters only, a real email format, mobile numbers checked by country code, and a strong password rule shown as a checklist.",
          "Sign-in with Google or Facebook (OAuth 2.0).",
          "\"Remember me\" login.",
          "Profile page to update name and profile picture, change password (old password required, new one must be different), and see all your ads."
        ]
      },
      {
        "title": "Trust and safety",
        "items": [
          "Buyers can report a fake ad or a scam seller.",
          "An ad reported by 3 different people is hidden automatically until staff review it.",
          "Customer reviews with star ratings, open to registered users only.",
          "Admin panel to review reports, remove ads, block sellers (logs them out and takes down their ads), and hide fake reviews.",
          "Terms & Conditions allow customer data to be used for legal action against fraud."
        ]
      },
      {
        "title": "Services and content",
        "items": [
          "11 service pages: bike transfer, registration, biometric, e-challan, token tax and others, each with required documents and WhatsApp/call buttons.",
          "A guides section, including used-bike buying checklists, selling tips and model comparisons.",
          "Admin can add new services and articles without touching code."
        ]
      },
      {
        "title": "Security",
        "items": [
          "Passwords hashed with salted PBKDF2-SHA256; never stored in plain text.",
          "Session tokens kept in HttpOnly, Secure, SameSite cookies, with only a hash stored on the server.",
          "Every database query uses bound parameters, which prevents SQL injection.",
          "Protection against requests from other sites (CSRF), plus rate limiting with lock-out after repeated failed logins.",
          "All input validated on the server as well as the browser.",
          "Uploaded images are checked by their file content, not just the file name.",
          "Content Security Policy and other security headers."
        ]
      },
      {
        "title": "SEO and performance",
        "items": [
          "Clean URLs, correct canonical tags, and an XML sitemap, with a second sitemap that lists live ads automatically.",
          "Structured data: LocalBusiness, Product, Breadcrumb, FAQ and Article.",
          "Each used-bike ad gets its own title and description, and sold ads are removed from search results.",
          "Self-hosted fonts, compressed WebP images and no heavy frameworks."
        ]
      },
      {
        "title": "Design",
        "items": [
          "Fully responsive, tested on phones from 320px wide up to desktop.",
          "Brand colours taken from the logo, a condensed automotive typeface and a signature slanted \"road stripe\" on page headers.",
          "Subtle animations: a hero entrance, a header that shrinks on scroll, section reveals and smooth menus. They turn off automatically for users who prefer reduced motion."
        ]
      }
    ]
  },
  {
    "id": "khata-system",
    "title": "Khata Management System",
    "kind": "Installment POS & Khata (Ledger) Software",
    "type": "software",
    "source": "real",
    "status": "private",
    "featured": true,
    "confidential": true,
    "url": "",
    "repo": "",
    "summary": "A private point-of-sale and installment khata system built for Jahangir Motors. It handles bike sales, flexible installment schedules, payments, daily follow-ups, inventory, registrations and profit reports, live-synced across every device and installable on phones as an app.",
    "client": "Jahangir Motors sells motorcycles on monthly installments. Every customer has a khata (ledger) that has to stay accurate for years, across the shop counter, the owner's phone and staff devices.",
    "goals": [
      "Replace paper khata registers with one reliable system for sales, installments and follow-ups.",
      "Make it impossible to lose or double-count a payment, and show exactly which installment each payment covers.",
      "Help staff chase dues every day with one-tap calls, WhatsApp and SMS reminders in Urdu."
    ],
    "result": "The dealership runs its installment business from one system: sales, dues, payments, reminders, inventory and reports. This is a real-world system holding sensitive customer data, so every screenshot here uses demo data only.",
    "tech": [
      "HTML",
      "CSS",
      "JavaScript",
      "PWA"
    ],
    "tags": [
      "POS",
      "Installments",
      "Ledger",
      "Live Sync",
      "PWA",
      "Reports"
    ],
    "images": [
      {
        "src": "assets/projects/khata-system/01-cover.webp",
        "caption": "Customer khata: dues summary and invoices"
      },
      {
        "src": "assets/projects/khata-system/02-dashboard.webp",
        "caption": "Dashboard: customers, sales, collections and stock at a glance"
      },
      {
        "src": "assets/projects/khata-system/03-dues-summary-installment-schedule.webp",
        "caption": "Dues summary and installment schedule"
      },
      {
        "src": "assets/projects/khata-system/04-installment-schedule-generator.webp",
        "caption": "Flexible installment schedule generator"
      },
      {
        "src": "assets/projects/khata-system/05-payment-allocation-preview.webp",
        "caption": "Receive payment: allocation preview before saving"
      },
      {
        "src": "assets/projects/khata-system/06-khata-ledger.webp",
        "caption": "Khata ledger: every payment shows which installment it covered"
      },
      {
        "src": "assets/projects/khata-system/07-todays-due-follow-up.webp",
        "caption": "Today's Due: call, WhatsApp and SMS follow-ups"
      },
      {
        "src": "assets/projects/khata-system/08-yearly-report.webp",
        "caption": "Yearly report with monthly breakdown"
      },
      {
        "src": "assets/projects/khata-system/09-pdf-statement.webp",
        "caption": "One-click PDF khata statement"
      },
      {
        "src": "assets/projects/khata-system/10-mobile-khata.webp",
        "caption": "Mobile: customer khata"
      },
      {
        "src": "assets/projects/khata-system/11-mobile-dues-summary.webp",
        "caption": "Mobile: dues summary"
      }
    ],
    "features": [
      {
        "title": "Sales & customers",
        "items": [
          "Make a Sale: customer, invoice, bike from inventory and guarantee documents in one flow.",
          "Flexible installment schedules: special installments at the start or end, extra amounts on fixed dates, a settlement deadline, and a preview before the schedule is saved.",
          "Add Existing Customer: bring data from the old paper registers into the system.",
          "Multiple invoices in one khata (bike exchange or upgrade).",
          "Saved Slips and a Net Sale (cash sale) register."
        ]
      },
      {
        "title": "Khata (ledger)",
        "items": [
          "Dues summary: total payable, received, outstanding, overdue, this month's installment, credit and next installment.",
          "Status for every installment: Paid, Part paid, Due today, Overdue, Upcoming.",
          "Payments are applied to the oldest installment first, and every payment records which installment it was applied to.",
          "Edit Khata, Exchange / Balance Transfer, Clear (with concession) and Expire (with refund).",
          "Recycle Bin, and Delete Khata that only works after typing the khata number.",
          "One-click PDF statement download."
        ]
      },
      {
        "title": "Installments & follow-up",
        "items": [
          "Receive Payment: shows which installments the payment will cover before saving, plus a printable receipt.",
          "Today's Due: Call, WhatsApp and SMS buttons, an Urdu reminder message, tick-off, and Undo / Redo.",
          "Outstanding Accounts and a follow-up call log.",
          "Notifications and global search (Ctrl + K)."
        ]
      },
      {
        "title": "Business",
        "items": [
          "Bike inventory (stock / sold, registration).",
          "New Registration and Transfer Vehicle registers.",
          "Expenses.",
          "Monthly, Yearly and Profit & Loss reports.",
          "Data Check: a report of any figures that don't reconcile."
        ]
      },
      {
        "title": "Reliability",
        "items": [
          "Live sync across all devices every 5 seconds.",
          "PWA: installs on a phone like an app.",
          "The same payment can never be saved twice, and amounts are always whole rupees.",
          "Overdue calculated in Pakistan time (Asia/Karachi).",
          "42 automated tests."
        ]
      }
    ]
  },
  {
    "id": "ember-spice",
    "title": "Ember & Spice",
    "kind": "Restaurant Website",
    "type": "website",
    "source": "demo",
    "status": "live",
    "featured": true,
    "confidential": false,
    "url": "https://ember-spice-nu.vercel.app/",
    "repo": "",
    "summary": "A warm, appetising restaurant website with a tabbed menu, photo gallery, guest reviews and a smart table-booking form that respects time zones and opening hours, built with Next.js.",
    "client": "",
    "goals": [],
    "result": "",
    "tech": [
      "TypeScript",
      "JavaScript",
      "React (TSX)",
      "Next.js",
      "Tailwind CSS",
      "HTML",
      "CSS"
    ],
    "tags": [
      "Restaurant",
      "Booking Form",
      "Next.js",
      "Responsive"
    ],
    "images": [
      {
        "src": "assets/projects/ember-spice/cover.webp",
        "caption": "Ember & Spice: desktop and mobile"
      }
    ],
    "features": [
      {
        "title": "Layout & content",
        "items": [
          "Navbar with a mobile menu and a header that changes on scroll.",
          "Hero section, about and stats.",
          "Menu tabs with 5 categories (Starters, Grill, Curries, Rice & Bread, Desserts), tagged Spicy, Vegetarian or Chef's pick.",
          "Photo gallery and guest reviews."
        ]
      },
      {
        "title": "Table booking form",
        "items": [
          "Only today and future dates, up to 30 days ahead.",
          "Same-day bookings at least 5 hours in advance.",
          "Time slots shown in the visitor's own time zone.",
          "Names accept letters only and phone numbers digits only.",
          "Bookings arrive by email, with a success notification on screen.",
          "Delivery by WhatsApp or email, switchable from a setting."
        ]
      },
      {
        "title": "Visit & details",
        "items": [
          "Opening hours, address and Google Maps link.",
          "Floating WhatsApp button.",
          "If a photo fails to load, a clean placeholder appears instead of a broken-image icon."
        ]
      }
    ]
  },
  {
    "id": "northgate-realty",
    "title": "Northgate Realty",
    "kind": "Real Estate Website",
    "type": "website",
    "source": "demo",
    "status": "live",
    "featured": true,
    "confidential": false,
    "url": "https://northgate-realty.vercel.app/",
    "repo": "",
    "summary": "A modern real estate website with shareable property search, 12 auto-generated property pages, a live mortgage calculator and lead forms that tell the agent exactly which home a buyer is asking about, built with Next.js.",
    "client": "",
    "goals": [],
    "result": "",
    "tech": [
      "TypeScript",
      "JavaScript",
      "React (TSX)",
      "Next.js",
      "Tailwind CSS",
      "HTML",
      "CSS"
    ],
    "tags": [
      "Real Estate",
      "Search & Filters",
      "Next.js",
      "SEO"
    ],
    "images": [
      {
        "src": "assets/projects/northgate-realty/cover.webp",
        "caption": "Northgate Realty: desktop and mobile"
      }
    ],
    "features": [
      {
        "title": "Property search",
        "items": [
          "Home page search: Buy / Rent, area, type and maximum price.",
          "Listings page filters: area, type, bedrooms and price, with sorting by price or size.",
          "Every search has its own link, so it can be shared or bookmarked.",
          "The browser's Back button brings the previous search back.",
          "When nothing matches, a \"No homes match\" message with a Clear filters button."
        ]
      },
      {
        "title": "Property pages",
        "items": [
          "A separate page for every property (12 pages, generated automatically).",
          "Photo gallery and details: beds, baths, area, year built and parking.",
          "Features list, Google Maps link and similar homes."
        ]
      },
      {
        "title": "Mortgage calculator",
        "items": [
          "Sliders for deposit, interest rate and loan term.",
          "The monthly payment updates instantly."
        ]
      },
      {
        "title": "Leads & extras",
        "items": [
          "Viewing-request form that automatically includes the property and agent name in the email.",
          "Neighbourhoods, agents (with a backup photo or initials) and testimonials.",
          "Free valuation / contact form, a 404 page, and an SEO title for every page."
        ]
      }
    ]
  },
  {
    "id": "hum-mart",
    "title": "Hum Mart",
    "kind": "Multi-Vendor E-Commerce App",
    "type": "app",
    "source": "real",
    "status": "development",
    "featured": false,
    "confidential": false,
    "url": "",
    "repo": "",
    "summary": "A marketplace app like Daraz where multiple shopkeepers and sellers create accounts, upload product photos and sell, with seller dashboards, product listings and orders.",
    "client": "",
    "goals": [],
    "result": "",
    "tech": [
      "Flutter",
      "Firebase",
      "Node.js",
      "Cloud Storage"
    ],
    "tags": [
      "Marketplace",
      "Mobile App"
    ],
    "images": [
      {
        "src": "assets/projects/hum-mart/cover.webp",
        "caption": "Hum Mart: app concept"
      }
    ],
    "features": []
  }
];
