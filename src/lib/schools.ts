/**
 * StudySync — Sri Lankan Schools Dataset & Autocomplete Engine
 * Comprehensive dataset of 306 National, Provincial, and Popular Schools across all 9 Provinces and 25 Districts.
 */

export type Province =
  | 'Western'
  | 'Central'
  | 'Southern'
  | 'Northern'
  | 'Eastern'
  | 'North Western'
  | 'North Central'
  | 'Uva'
  | 'Sabaragamuwa';

export type District =
  | 'Colombo'
  | 'Gampaha'
  | 'Kalutara'
  | 'Kandy'
  | 'Matale'
  | 'Nuwara Eliya'
  | 'Galle'
  | 'Matara'
  | 'Hambantota'
  | 'Jaffna'
  | 'Kilinochchi'
  | 'Mannar'
  | 'Vavuniya'
  | 'Mullaitivu'
  | 'Batticaloa'
  | 'Ampara'
  | 'Trincomalee'
  | 'Kurunegala'
  | 'Puttalam'
  | 'Anuradhapura'
  | 'Polonnaruwa'
  | 'Badulla'
  | 'Monaragala'
  | 'Ratnapura'
  | 'Kegalle';

export type SchoolGender = 'Boys' | 'Girls' | 'Mixed';
export type SchoolType = 'National' | 'Provincial' | 'Private/Semi-Gov';

export interface School {
  id: string;
  name: string;
  district: District | string;
  province: Province | string;
  gender: SchoolGender | string;
  type: SchoolType | string;
}

export const PROVINCES: readonly Province[] = [
  'Western',
  'Central',
  'Southern',
  'Northern',
  'Eastern',
  'North Western',
  'North Central',
  'Uva',
  'Sabaragamuwa',
] as const;

export const DISTRICTS: readonly District[] = [
  'Colombo',
  'Gampaha',
  'Kalutara',
  'Kandy',
  'Matale',
  'Nuwara Eliya',
  'Galle',
  'Matara',
  'Hambantota',
  'Jaffna',
  'Kilinochchi',
  'Mannar',
  'Vavuniya',
  'Mullaitivu',
  'Batticaloa',
  'Ampara',
  'Trincomalee',
  'Kurunegala',
  'Puttalam',
  'Anuradhapura',
  'Polonnaruwa',
  'Badulla',
  'Monaragala',
  'Ratnapura',
  'Kegalle',
] as const;

export const PROVINCE_DISTRICT_MAP: Record<Province, readonly District[]> = {
  Western: ['Colombo', 'Gampaha', 'Kalutara'],
  Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
  Southern: ['Galle', 'Matara', 'Hambantota'],
  Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  Eastern: ['Batticaloa', 'Ampara', 'Trincomalee'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  Uva: ['Badulla', 'Monaragala'],
  Sabaragamuwa: ['Ratnapura', 'Kegalle'],
};

export const SRI_LANKAN_SCHOOLS: readonly School[] = [
  // ==========================================
  // WESTERN PROVINCE - COLOMBO DISTRICT (50)
  // ==========================================
  { id: 'CMB-001', name: 'Royal College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-002', name: 'Ananda College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-003', name: 'Nalanda College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-004', name: 'Visakha Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-005', name: 'Devi Balika Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-006', name: 'Sirimavo Bandaranaike Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-007', name: "St. Joseph's College, Colombo", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-008', name: "St. Peter's College, Colombo", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-009', name: "S. Thomas' College, Mount Lavinia", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-010', name: "Ladies' College, Colombo", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-011', name: "Bishop's College, Colombo", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-012', name: 'Musaeus College, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-013', name: "St. Bridget's Convent, Colombo", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-014', name: 'Methodist College, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-015', name: 'Wesley College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-016', name: 'D.S. Senanayake College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-017', name: 'Mahanama College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-018', name: 'Thurstan College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-019', name: 'Isipathana College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-020', name: 'Anula Vidyalaya, Nugegoda', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-021', name: "St. John's College, Nugegoda", district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-022', name: "St. Joseph's Girls' School, Nugegoda", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-023', name: 'Samudradevi Balika Vidyalaya, Nugegoda', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-024', name: "St. Sebastian's College, Moratuwa", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-025', name: "Prince of Wales' College, Moratuwa", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-026', name: "Princess of Wales' College, Moratuwa", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-027', name: 'Our Lady of Victories Convent, Moratuwa', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-028', name: 'Moratu Maha Vidyalaya, Moratuwa', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-029', name: 'Dharmapala Vidyalaya, Pannipitiya', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-030', name: "President's College, Rajagiriya", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-031', name: "President's College, Maharagama", district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-032', name: 'Central College, Piliyandala', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-033', name: 'Siri Piyarathana Central College, Padukka', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-034', name: 'Seethawaka National School, Avissawella', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-035', name: "St. Paul's Girls' School, Milagiriya", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-036', name: 'Hindu College, Colombo (Bambalapitiya)', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-037', name: 'Ramanathan Hindu Ladies College, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-038', name: 'Zahira College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-039', name: 'Muslim Ladies College, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-040', name: "St. Anthony's Balika Maha Vidyalaya, Colombo", district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-041', name: 'Gothami Balika Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-042', name: 'Yasodhara Balika Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'CMB-043', name: 'Lumbini College, Colombo', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-044', name: 'Carey College, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-045', name: 'Holy Family Convent, Bambalapitiya', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-046', name: "St. Benedict's College, Kotahena", district: 'Colombo', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'CMB-047', name: 'Good Shepherd Convent, Kotahena', district: 'Colombo', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'CMB-048', name: 'Asoka Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'CMB-049', name: 'C.W.W. Kannangara Vidyalaya, Colombo', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'CMB-050', name: 'Sri Subhuthi National School, Battaramulla', district: 'Colombo', province: 'Western', gender: 'Mixed', type: 'National' },

  // ==========================================
  // WESTERN PROVINCE - GAMPAHA DISTRICT (25)
  // ==========================================
  { id: 'GAM-001', name: 'Bandaranayake College, Gampaha', district: 'Gampaha', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'GAM-002', name: 'Rathnavali Balika Vidyalaya, Gampaha', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-003', name: 'Holy Cross College, Gampaha', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-004', name: 'Bandaranayake Central College, Veyangoda', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-005', name: 'Maris Stella College, Negombo', district: 'Gampaha', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'GAM-006', name: 'Ave Maria Convent, Negombo', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'GAM-007', name: 'Newstead Girls College, Negombo', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-008', name: 'Harischandra National College, Negombo', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-009', name: 'Gurukula College, Kelaniya', district: 'Gampaha', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'GAM-010', name: 'Sri Dharmaloka College, Kelaniya', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-011', name: "St. Paul's Balika Maha Vidyalaya, Kelaniya", district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-012', name: 'Taxila Central College, Horana', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-013', name: 'Gothami Balika Vidyalaya, Gampaha', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-014', name: 'Anura Central College, Yakkala', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-015', name: 'Siyane National School, Dompe', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-016', name: 'Al-Hilal Central College, Negombo', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-017', name: 'De Mazenod College, Kandana', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'Private/Semi-Gov' },
  { id: 'GAM-018', name: "St. Anthony's College, Wattala", district: 'Gampaha', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'GAM-019', name: 'Loyola College, Bopitiya', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'Private/Semi-Gov' },
  { id: 'GAM-020', name: 'Regent International College, Gampaha', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'Private/Semi-Gov' },
  { id: 'GAM-021', name: 'Minuwangoda Nalanda (Boys) Central College', district: 'Gampaha', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'GAM-022', name: 'Minuwangoda Nalanda (Girls) Central College', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-023', name: 'Sanghamitta Balika Vidyalaya, Kirindiwela', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'GAM-024', name: 'Kirindiwela Central College', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'GAM-025', name: 'Sapugaskanda Vishaka Balika Vidyalaya', district: 'Gampaha', province: 'Western', gender: 'Girls', type: 'National' },

  // ==========================================
  // WESTERN PROVINCE - KALUTARA DISTRICT (21)
  // ==========================================
  { id: 'KAL-001', name: 'Kalutara Vidyalaya, Kalutara', district: 'Kalutara', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'KAL-002', name: 'Kalutara Balika Vidyalaya, Kalutara', district: 'Kalutara', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'KAL-003', name: 'Tissa Central College, Kalutara', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-004', name: 'Holy Cross College, Kalutara', district: 'Kalutara', province: 'Western', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'KAL-005', name: 'Miriswatta National School, Dodangoda', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-006', name: 'Sri Palee College, Horana', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-007', name: 'Medankara Maha Vidyalaya, Horana', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-008', name: 'Panadura Royal College, Panadura', district: 'Kalutara', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'KAL-009', name: 'Sri Sumangala College, Panadura', district: 'Kalutara', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'KAL-010', name: "Sri Sumangala Girls' School, Panadura", district: 'Kalutara', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'KAL-011', name: "St. John's National College, Panadura", district: 'Kalutara', province: 'Western', gender: 'Boys', type: 'National' },
  { id: 'KAL-012', name: 'Agamethi Balika Vidyalaya, Panadura', district: 'Kalutara', province: 'Western', gender: 'Girls', type: 'National' },
  { id: 'KAL-013', name: 'Wadduwa Central College, Wadduwa', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-014', name: 'Aluthgama Maha Vidyalaya, Aluthgama', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-015', name: 'Zahira College, Dharga Town', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-016', name: 'C.W.W. Kannangara Central College, Matugama', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-017', name: "St. Mary's College, Matugama", district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-018', name: 'Ananda Sastralaya, Matugama', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KAL-019', name: 'Bulathsinhala Central College', district: 'Kalutara', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KDY-017', name: 'Galahitiyawa Central College, Ganemulla', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },
  { id: 'KDY-018', name: 'D.S. Senanayake Central College, Mirigama', district: 'Gampaha', province: 'Western', gender: 'Mixed', type: 'National' },

  // ==========================================
  // CENTRAL PROVINCE - KANDY DISTRICT (22)
  // ==========================================
  { id: 'KDY-001', name: 'Dharmaraja College, Kandy', district: 'Kandy', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'KDY-002', name: 'Kingswood College, Kandy', district: 'Kandy', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'KDY-003', name: 'Trinity College, Kandy', district: 'Kandy', province: 'Central', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'KDY-004', name: "St. Anthony's College, Kandy", district: 'Kandy', province: 'Central', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'KDY-005', name: "Mahamaya Girls' College, Kandy", district: 'Kandy', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'KDY-006', name: "Girls' High School, Kandy", district: 'Kandy', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'KDY-007', name: 'Hillwood College, Kandy', district: 'Kandy', province: 'Central', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'KDY-008', name: "Pushpadana Girls' College, Kandy", district: 'Kandy', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'KDY-009', name: "St. Anthony's Girls' College, Kandy", district: 'Kandy', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'KDY-010', name: 'Good Shepherd Convent, Kandy', district: 'Kandy', province: 'Central', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'KDY-011', name: 'Vidyartha College, Kandy', district: 'Kandy', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'KDY-012', name: 'Sri Sumangala College, Kandy', district: 'Kandy', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'KDY-013', name: "St. Sylvester's College, Kandy", district: 'Kandy', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'KDY-014', name: 'Seethadevi Balika Vidyalaya, Kandy', district: 'Kandy', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'KDY-015', name: 'Wariyapola Sri Sumangala College, Kandy', district: 'Kandy', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'KDY-016', name: 'Swarnamali Balika Vidyalaya, Kandy', district: 'Kandy', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'KDY-019', name: 'Teldeniya National School, Teldeniya', district: 'Kandy', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'KDY-020', name: 'Nugawela Central College, Nugawela', district: 'Kandy', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'KDY-021', name: 'Wattegama Central College, Wattegama', district: 'Kandy', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'KDY-022', name: 'Gampola Wickramabahu National College', district: 'Kandy', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'KDY-023', name: 'Zahira College, Gampola', district: 'Kandy', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'KDY-024', name: 'Sarasavi Uyana Maha Vidyalaya, Peradeniya', district: 'Kandy', province: 'Central', gender: 'Mixed', type: 'National' },

  // ==========================================
  // CENTRAL PROVINCE - MATALE & NUWARA ELIYA (14)
  // ==========================================
  { id: 'MTL-001', name: "St. Thomas' College, Matale", district: 'Matale', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'MTL-002', name: 'Christ Church College, Matale', district: 'Matale', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'MTL-003', name: 'Sri Sangamitta Balika National School, Matale', district: 'Matale', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'MTL-004', name: 'Vijaya College, Matale', district: 'Matale', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'MTL-005', name: 'Zahira College, Matale', district: 'Matale', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'MTL-006', name: 'Government Science College, Matale', district: 'Matale', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'NWE-001', name: 'Holy Trinity Central College, Nuwara Eliya', district: 'Nuwara Eliya', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'NWE-002', name: "St. Xavier's College, Nuwara Eliya", district: 'Nuwara Eliya', province: 'Central', gender: 'Boys', type: 'National' },
  { id: 'NWE-003', name: 'Good Shepherd Convent, Nuwara Eliya', district: 'Nuwara Eliya', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'NWE-004', name: 'Gamini National School, Nuwara Eliya', district: 'Nuwara Eliya', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'NWE-005', name: 'Poramadulla Central College, Rikillagaskada', district: 'Nuwara Eliya', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'NWE-006', name: 'Highlands Central College, Hatton', district: 'Nuwara Eliya', province: 'Central', gender: 'Mixed', type: 'National' },
  { id: 'NWE-007', name: "St. Gabriel's Girls' College, Hatton", district: 'Nuwara Eliya', province: 'Central', gender: 'Girls', type: 'National' },
  { id: 'NWE-008', name: "St. John Bosco's College, Hatton", district: 'Nuwara Eliya', province: 'Central', gender: 'Boys', type: 'National' },

  // ==========================================
  // SOUTHERN PROVINCE - GALLE DISTRICT (19)
  // ==========================================
  { id: 'GLE-001', name: 'Richmond College, Galle', district: 'Galle', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'GLE-002', name: 'Mahinda College, Galle', district: 'Galle', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'GLE-003', name: 'Southlands College, Galle', district: 'Galle', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'GLE-004', name: 'Sanghamitta Balika Vidyalaya, Galle', district: 'Galle', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'GLE-005', name: "St. Aloysius' College, Galle", district: 'Galle', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'GLE-006', name: 'Sacred Heart Convent, Galle', district: 'Galle', province: 'Southern', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'GLE-007', name: 'Vidyaloka College, Galle', district: 'Galle', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'GLE-008', name: "Ripon Girls' Collective School, Galle", district: 'Galle', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'GLE-009', name: 'Dharmasoka College, Ambalangoda', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-010', name: 'Sri Devananda College, Ambalangoda', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-011', name: 'P. De S. Kularatne Maha Vidyalaya, Ambalangoda', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-012', name: 'Ananda Central College, Elpitiya', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-013', name: 'Nalanda Maha Vidyalaya, Elpitiya', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-014', name: 'Nagoda Royal National College, Galle', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-015', name: 'Batapola Central College, Galle', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-016', name: "Christ Church Boys' College, Baddegama", district: 'Galle', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'GLE-017', name: "Christ Church Girls' College, Baddegama", district: 'Galle', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'GLE-018', name: 'Devapathiraja National College, Rathgama', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'GLE-019', name: 'Bonavista College, Unawatuna', district: 'Galle', province: 'Southern', gender: 'Mixed', type: 'National' },

  // ==========================================
  // SOUTHERN PROVINCE - MATARA & HAMBANTOTA (20)
  // ==========================================
  { id: 'MTR-001', name: 'Rahula College, Matara', district: 'Matara', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'MTR-002', name: 'Sujatha Vidyalaya, Matara', district: 'Matara', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'MTR-003', name: "St. Thomas' College, Matara", district: 'Matara', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'MTR-004', name: "St. Thomas' Girls' High School, Matara", district: 'Matara', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'MTR-005', name: "St. Servatius' College, Matara", district: 'Matara', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'MTR-006', name: 'Convent of Mary Immaculate, Matara', district: 'Matara', province: 'Southern', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'MTR-007', name: 'Matara Central College, Matara', district: 'Matara', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'MTR-008', name: 'Siddhartha College, Weligama', district: 'Matara', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'MTR-009', name: 'Sri Sumangala Balika Vidyalaya, Weligama', district: 'Matara', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'MTR-010', name: 'Dickwella Vijitha Central College, Dickwella', district: 'Matara', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'MTR-011', name: 'Telijjawila Central College, Telijjawila', district: 'Matara', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'MTR-012', name: 'Puhulwella Central College, Puhulwella', district: 'Matara', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'HBT-001', name: 'Debarawewa Central College, Tissamaharama', district: 'Hambantota', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'HBT-002', name: 'Theraputta National School, Ambalantota', district: 'Hambantota', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'HBT-003', name: "Tangalle Boys' School, Tangalle", district: 'Hambantota', province: 'Southern', gender: 'Boys', type: 'National' },
  { id: 'HBT-004', name: "Tangalle Girls' School, Tangalle", district: 'Hambantota', province: 'Southern', gender: 'Girls', type: 'National' },
  { id: 'HBT-005', name: 'Zahira National College, Hambantota', district: 'Hambantota', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'HBT-006', name: 'Ranna Maha Vidyalaya, Ranna', district: 'Hambantota', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'HBT-007', name: 'Suriyawewa National School, Suriyawewa', district: 'Hambantota', province: 'Southern', gender: 'Mixed', type: 'National' },
  { id: 'HBT-008', name: 'Beliatta Central College, Beliatta', district: 'Hambantota', province: 'Southern', gender: 'Mixed', type: 'National' },

  // ==========================================
  // NORTHERN PROVINCE - JAFFNA & DISTRICTS (26)
  // ==========================================
  { id: 'JAF-001', name: 'Jaffna Hindu College, Jaffna', district: 'Jaffna', province: 'Northern', gender: 'Boys', type: 'National' },
  { id: 'JAF-002', name: 'Jaffna Central College, Jaffna', district: 'Jaffna', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'JAF-003', name: "St. John's College, Jaffna", district: 'Jaffna', province: 'Northern', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'JAF-004', name: "St. Patrick's College, Jaffna", district: 'Jaffna', province: 'Northern', gender: 'Boys', type: 'Private/Semi-Gov' },
  { id: 'JAF-005', name: 'Hartley College, Point Pedro', district: 'Jaffna', province: 'Northern', gender: 'Boys', type: 'National' },
  { id: 'JAF-006', name: "Vembadi Girls' High School, Jaffna", district: 'Jaffna', province: 'Northern', gender: 'Girls', type: 'National' },
  { id: 'JAF-007', name: "Chundikuli Girls' College, Jaffna", district: 'Jaffna', province: 'Northern', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'JAF-008', name: 'Holy Family Convent, Jaffna', district: 'Jaffna', province: 'Northern', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'JAF-009', name: "Jaffna Hindu Ladies' College, Jaffna", district: 'Jaffna', province: 'Northern', gender: 'Girls', type: 'National' },
  { id: 'JAF-010', name: "Methodist Girls' High School, Point Pedro", district: 'Jaffna', province: 'Northern', gender: 'Girls', type: 'National' },
  { id: 'JAF-011', name: 'Kokuvil Hindu College, Kokuvil', district: 'Jaffna', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'JAF-012', name: 'Mahajana College, Tellippalai', district: 'Jaffna', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'JAF-013', name: 'Skandavarodaya College, Chunnakam', district: 'Jaffna', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'JAF-014', name: 'Union College, Tellippalai', district: 'Jaffna', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'JAF-015', name: "Uduvil Girls' College, Chunnakam", district: 'Jaffna', province: 'Northern', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'KLN-001', name: 'Kilinochchi Central College, Kilinochchi', district: 'Kilinochchi', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'KLN-002', name: 'Kilinochchi Hindu College, Kilinochchi', district: 'Kilinochchi', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'KLN-003', name: "St. Theresa's Girls' College, Kilinochchi", district: 'Kilinochchi', province: 'Northern', gender: 'Girls', type: 'Provincial' },
  { id: 'MNR-001', name: "St. Xavier's Boys' College, Mannar", district: 'Mannar', province: 'Northern', gender: 'Boys', type: 'National' },
  { id: 'MNR-002', name: "St. Xavier's Girls' College, Mannar", district: 'Mannar', province: 'Northern', gender: 'Girls', type: 'National' },
  { id: 'MNR-003', name: 'Mannar Sithy Vinayagar Hindu College', district: 'Mannar', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'VAV-001', name: 'Vavuniya Tamil Maha Vidyalayam, Vavuniya', district: 'Vavuniya', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'VAV-002', name: 'Vavuniya Hindu College, Vavuniya', district: 'Vavuniya', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'VAV-003', name: 'Vavuniya Muslim Maha Vidyalayam', district: 'Vavuniya', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'MUL-001', name: 'Mullaitivu Maha Vidyalayam, Mullaitivu', district: 'Mullaitivu', province: 'Northern', gender: 'Mixed', type: 'National' },
  { id: 'MUL-002', name: 'Vidyananda College, Mulliyawalai', district: 'Mullaitivu', province: 'Northern', gender: 'Mixed', type: 'National' },

  // ==========================================
  // EASTERN PROVINCE - BATTICALOA, AMPARA, TRINCOMALEE (24)
  // ==========================================
  { id: 'BAT-001', name: "St. Michael's College, Batticaloa", district: 'Batticaloa', province: 'Eastern', gender: 'Boys', type: 'National' },
  { id: 'BAT-002', name: "St. Cecilia's Girls' College, Batticaloa", district: 'Batticaloa', province: 'Eastern', gender: 'Girls', type: 'National' },
  { id: 'BAT-003', name: "Vincent Girls' High School, Batticaloa", district: 'Batticaloa', province: 'Eastern', gender: 'Girls', type: 'National' },
  { id: 'BAT-004', name: 'Shivananda National School, Batticaloa', district: 'Batticaloa', province: 'Eastern', gender: 'Boys', type: 'National' },
  { id: 'BAT-005', name: 'Batticaloa Hindu College, Batticaloa', district: 'Batticaloa', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'BAT-006', name: 'Al-Azhar Central College, Batticaloa', district: 'Batticaloa', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'BAT-007', name: 'Kattankudy Central College, Kattankudy', district: 'Batticaloa', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'BAT-008', name: 'Valaichchenai Hindu College, Valaichchenai', district: 'Batticaloa', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'AMP-001', name: 'D.S. Senanayake National College, Ampara', district: 'Ampara', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'AMP-002', name: 'Bandaranayake Balika Vidyalaya, Ampara', district: 'Ampara', province: 'Eastern', gender: 'Girls', type: 'National' },
  { id: 'AMP-003', name: 'Zahira College, Kalmunai', district: 'Ampara', province: 'Eastern', gender: 'Boys', type: 'National' },
  { id: 'AMP-004', name: 'Carmel Fatima College, Kalmunai', district: 'Ampara', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'AMP-005', name: 'Wesley High School, Kalmunai', district: 'Ampara', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'AMP-006', name: 'Mahmud Ladies College, Kalmunai', district: 'Ampara', province: 'Eastern', gender: 'Girls', type: 'National' },
  { id: 'AMP-007', name: 'Akkaraipattu Muslim Central College', district: 'Ampara', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'AMP-008', name: 'Akkaraipattu Sri Ramakrishna College', district: 'Ampara', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'AMP-009', name: 'Dehiattakandiya National School', district: 'Ampara', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'TRN-001', name: "St. Joseph's College, Trincomalee", district: 'Trincomalee', province: 'Eastern', gender: 'Boys', type: 'National' },
  { id: 'TRN-002', name: "St. Mary's College, Trincomalee", district: 'Trincomalee', province: 'Eastern', gender: 'Girls', type: 'National' },
  { id: 'TRN-003', name: 'Trincomalee Koneswara Hindu College', district: 'Trincomalee', province: 'Eastern', gender: 'Boys', type: 'National' },
  { id: 'TRN-004', name: 'Sri Shanmuga Hindu Ladies College, Trincomalee', district: 'Trincomalee', province: 'Eastern', gender: 'Girls', type: 'National' },
  { id: 'TRN-005', name: "Orr's Hill Vivekananda College, Trincomalee", district: 'Trincomalee', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'TRN-006', name: 'Kinniya Central College, Kinniya', district: 'Trincomalee', province: 'Eastern', gender: 'Mixed', type: 'National' },
  { id: 'TRN-007', name: 'Muthur Central College, Muthur', district: 'Trincomalee', province: 'Eastern', gender: 'Mixed', type: 'National' },

  // ==========================================
  // NORTH WESTERN PROVINCE - KURUNEGALA & PUTTALAM (25)
  // ==========================================
  { id: 'KUR-001', name: 'Maliyadeva College, Kurunegala', district: 'Kurunegala', province: 'North Western', gender: 'Boys', type: 'National' },
  { id: 'KUR-002', name: 'Maliyadeva Balika Vidyalaya, Kurunegala', district: 'Kurunegala', province: 'North Western', gender: 'Girls', type: 'National' },
  { id: 'KUR-003', name: "St. Anne's College, Kurunegala", district: 'Kurunegala', province: 'North Western', gender: 'Boys', type: 'National' },
  { id: 'KUR-004', name: 'Holy Family Convent, Kurunegala', district: 'Kurunegala', province: 'North Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'KUR-005', name: 'Sir John Kotalawala National College, Kurunegala', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-006', name: 'Wayamba Royal College, Kurunegala', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-007', name: 'Kuliyapitiya Central College, Kuliyapitiya', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-008', name: 'Holy Infant Jesus Convent, Kuliyapitiya', district: 'Kurunegala', province: 'North Western', gender: 'Girls', type: 'Provincial' },
  { id: 'KUR-009', name: 'Ibbagamuwa Central College, Ibbagamuwa', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-010', name: 'Wickramashila National School, Giriulla', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-011', name: 'Mayurapada Central College, Narammala', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-012', name: 'Mawatagama National School, Mawatagama', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-013', name: 'Pannala National School, Pannala', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-014', name: 'Kekunagolla National School, Kekunagolla', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'KUR-015', name: 'Parakramabahu Central College, Polgahawela', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'PUT-001', name: 'Joseph Vaz College, Wennappuwa', district: 'Puttalam', province: 'North Western', gender: 'Boys', type: 'National' },
  { id: 'PUT-002', name: 'Holy Family Convent, Wennappuwa', district: 'Puttalam', province: 'North Western', gender: 'Girls', type: 'Private/Semi-Gov' },
  { id: 'PUT-003', name: "St. Mary's Senior Secondary School, Chilaw", district: 'Puttalam', province: 'North Western', gender: 'Boys', type: 'National' },
  { id: 'PUT-004', name: 'Ananda National College, Chilaw', district: 'Puttalam', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'PUT-005', name: 'Dhammissara National College, Nattandiya', district: 'Puttalam', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'PUT-006', name: 'Zahira National College, Puttalam', district: 'Puttalam', province: 'North Western', gender: 'Boys', type: 'National' },
  { id: 'PUT-007', name: "St. Andrew's Central College, Puttalam", district: 'Puttalam', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'PUT-008', name: 'Fathima Balika Maha Vidyalaya, Puttalam', district: 'Puttalam', province: 'North Western', gender: 'Girls', type: 'National' },
  { id: 'PUT-009', name: 'Mahasen National School, Nikaweratiya', district: 'Kurunegala', province: 'North Western', gender: 'Mixed', type: 'National' },
  { id: 'PUT-010', name: 'Anamaduwa Central College, Anamaduwa', district: 'Puttalam', province: 'North Western', gender: 'Mixed', type: 'National' },

  // ==========================================
  // NORTH CENTRAL PROVINCE - ANURADHAPURA & POLONNARUWA (17)
  // ==========================================
  { id: 'ANR-001', name: 'Anuradhapura Central College, Anuradhapura', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-002', name: 'Swarnapali Balika Maha Vidyalaya, Anuradhapura', district: 'Anuradhapura', province: 'North Central', gender: 'Girls', type: 'National' },
  { id: 'ANR-003', name: "St. Joseph's College, Anuradhapura", district: 'Anuradhapura', province: 'North Central', gender: 'Boys', type: 'National' },
  { id: 'ANR-004', name: 'Walisinghe Harischandra Maha Vidyalaya', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-005', name: 'Zahira Maha Vidyalaya, Anuradhapura', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-006', name: 'Kekirawa Central College, Kekirawa', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-007', name: 'Thambuttegama Central College, Thambuttegama', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-008', name: 'Medawachchiya Maithripala Senanayake Central College', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-009', name: 'Eppawala Siddhartha Central College', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'ANR-010', name: 'Galenbindunuwewa Central College', district: 'Anuradhapura', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'POL-001', name: 'Royal Central College, Polonnaruwa', district: 'Polonnaruwa', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'POL-002', name: 'Topawewa Maha Vidyalaya, Polonnaruwa', district: 'Polonnaruwa', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'POL-003', name: 'Medirigiriya National School, Medirigiriya', district: 'Polonnaruwa', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'POL-004', name: 'Hingurakgoda Ananda Balika Vidyalaya', district: 'Polonnaruwa', province: 'North Central', gender: 'Girls', type: 'National' },
  { id: 'POL-005', name: 'Hingurakgoda Rajarata Maha Vidyalaya', district: 'Polonnaruwa', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'POL-006', name: 'Manampitiya Sinhala Maha Vidyalaya', district: 'Polonnaruwa', province: 'North Central', gender: 'Mixed', type: 'National' },
  { id: 'POL-007', name: 'Bakamuna Mahasen Central College', district: 'Polonnaruwa', province: 'North Central', gender: 'Mixed', type: 'National' },

  // ==========================================
  // UVA PROVINCE - BADULLA & MONARAGALA (18)
  // ==========================================
  { id: 'BAD-001', name: 'Badulla Central College, Badulla', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'BAD-002', name: 'Dharmadutha College, Badulla', district: 'Badulla', province: 'Uva', gender: 'Boys', type: 'National' },
  { id: 'BAD-003', name: 'Visakha Balika Vidyalaya, Badulla', district: 'Badulla', province: 'Uva', gender: 'Girls', type: 'National' },
  { id: 'BAD-004', name: 'Viharamahadevi Balika Vidyalaya, Badulla', district: 'Badulla', province: 'Uva', gender: 'Girls', type: 'National' },
  { id: 'BAD-005', name: 'Uva College, Badulla', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'BAD-006', name: 'Bandarawela Central College, Bandarawela', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'BAD-007', name: "St. Joseph's College, Bandarawela", district: 'Badulla', province: 'Uva', gender: 'Boys', type: 'National' },
  { id: 'BAD-008', name: 'Visakha Vidyalaya, Bandarawela', district: 'Badulla', province: 'Uva', gender: 'Girls', type: 'National' },
  { id: 'BAD-009', name: 'Dharmapala Maha Vidyalaya, Bandarawela', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'BAD-010', name: 'Mahiyangana National School, Mahiyangana', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'BAD-011', name: 'Welimada Central College, Welimada', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'BAD-012', name: 'Haputale Tamil Central College, Haputale', district: 'Badulla', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'MON-001', name: 'Mahanama National College, Monaragala', district: 'Monaragala', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'MON-002', name: 'Royal College, Monaragala', district: 'Monaragala', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'MON-003', name: 'Wellawaya Central College, Wellawaya', district: 'Monaragala', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'MON-004', name: 'Bibile Central College, Bibile', district: 'Monaragala', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'MON-005', name: 'Buttala Dutugemunu Central College, Buttala', district: 'Monaragala', province: 'Uva', gender: 'Mixed', type: 'National' },
  { id: 'MON-006', name: 'Kataragama National School, Kataragama', district: 'Monaragala', province: 'Uva', gender: 'Mixed', type: 'National' },

  // ==========================================
  // SABARAGAMUWA PROVINCE - RATNAPURA & KEGALLE (25)
  // ==========================================
  { id: 'RAT-001', name: 'Ferguson High School, Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Girls', type: 'National' },
  { id: 'RAT-002', name: 'Sivali Central College, Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-003', name: "St. Aloysius' National College, Ratnapura", district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Boys', type: 'National' },
  { id: 'RAT-004', name: 'Sumana Balika Vidyalaya, Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Girls', type: 'National' },
  { id: 'RAT-005', name: 'Prince College, Ratnapura', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Boys', type: 'National' },
  { id: 'RAT-006', name: 'Balangoda Ananda Maithreya Central College', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-007', name: 'Embilipitiya National School, Embilipitiya', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-008', name: "President's College, Embilipitiya", district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-009', name: 'Eheliyagoda Central College, Eheliyagoda', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-010', name: 'Kuruwita Central College, Kuruwita', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-011', name: 'Kalawana National School, Kalawana', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'RAT-012', name: 'Nivitigala Sumana Central College', district: 'Ratnapura', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-001', name: 'Kegalu Vidyalaya, Kegalle', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Boys', type: 'National' },
  { id: 'KEG-002', name: 'Kegalu Balika Vidyalaya, Kegalle', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Girls', type: 'National' },
  { id: 'KEG-003', name: "St. Joseph's Balika Maha Vidyalaya, Kegalle", district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Girls', type: 'National' },
  { id: 'KEG-004', name: "St. Mary's College, Kegalle", district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Boys', type: 'National' },
  { id: 'KEG-005', name: 'Swarna Jayanthi Maha Vidyalaya, Kegalle', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-006', name: 'Zahira College, Mawanella', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-007', name: 'Mayurapada Central College, Mawanella', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-008', name: 'Baduriya Central College, Mawanella', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-009', name: 'Dudley Senanayake Central College, Tholangamuwa', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-010', name: 'Pinnawala Central College, Rambukkana', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-011', name: 'Dehiowita National School, Dehiowita', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-012', name: 'Ruwanwella Rajasinghe Central College', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
  { id: 'KEG-013', name: 'Deraniyagala Sri Pragnananda National School', district: 'Kegalle', province: 'Sabaragamuwa', gender: 'Mixed', type: 'National' },
] as const;

/**
 * Filter and rank schools based on user search query
 */
export function searchSchools(query: string, limit: number = 10): School[] {
  if (!query || typeof query !== 'string') return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const results: Array<{ school: School; score: number }> = [];

  for (const school of SRI_LANKAN_SCHOOLS) {
    const nameLower = school.name.toLowerCase();
    const districtLower = school.district.toLowerCase();
    const provinceLower = school.province.toLowerCase();

    let score = 0;
    if (nameLower.startsWith(q)) {
      score = 100;
    } else if (nameLower.includes(q)) {
      score = 80;
    } else if (districtLower.startsWith(q)) {
      score = 60;
    } else if (districtLower.includes(q)) {
      score = 40;
    } else if (provinceLower.includes(q)) {
      score = 20;
    }

    if (score > 0) {
      results.push({ school, score });
    }
  }

  // Sort by relevance score descending, then alphabetically by name
  results.sort((a, b) => b.score - a.score || a.school.name.localeCompare(b.school.name));

  return results.slice(0, limit).map((r) => r.school);
}

/**
 * Filter schools by substring match returning names array
 */
export function filterSchools(query: string, maxResults: number = 10): string[] {
  if (!query || typeof query !== 'string') return [];
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) return [];

  return SRI_LANKAN_SCHOOLS
    .map((s) => s.name)
    .filter((name) => name.toLowerCase().includes(cleanQuery))
    .slice(0, maxResults);
}

/**
 * Highlight matched search query in school name string
 */
export function highlightMatch(text: string, query: string): string {
  if (!query || !text) return text;
  const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!q) return text;
  const regex = new RegExp(`(${q})`, 'gi');
  return text.replace(regex, '<mark class="bg-indigo-500/40 text-indigo-200 font-semibold px-0.5 rounded">$1</mark>');
}

/**
 * Get all schools within a specific district
 */
export function getSchoolsByDistrict(district: District | string): School[] {
  return SRI_LANKAN_SCHOOLS.filter(
    (s) => s.district.toLowerCase() === district.trim().toLowerCase()
  );
}

/**
 * Get all schools within a specific province
 */
export function getSchoolsByProvince(province: Province | string): School[] {
  return SRI_LANKAN_SCHOOLS.filter(
    (s) => s.province.toLowerCase() === province.trim().toLowerCase()
  );
}

export default {
  SRI_LANKAN_SCHOOLS,
  PROVINCES,
  DISTRICTS,
  PROVINCE_DISTRICT_MAP,
  searchSchools,
  filterSchools,
  highlightMatch,
  getSchoolsByDistrict,
  getSchoolsByProvince,
};
