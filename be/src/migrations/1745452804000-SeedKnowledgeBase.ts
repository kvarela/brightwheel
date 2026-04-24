import { MigrationInterface, QueryRunner } from 'typeorm'

interface BaseEntry {
  key: string
  question: string
  answer: string
}

const BASE_ENTRIES: BaseEntry[] = [
  {
    key: 'operating_hours',
    question: 'What are your operating hours?',
    answer:
      'We are open Monday through Friday from 7:00am to 6:00pm. We are closed on all federal holidays and for one week of professional development in August.',
  },
  {
    key: 'tuition_rates',
    question: 'How much is tuition?',
    answer:
      'Tuition varies by age group. Infants are $1,850/month, toddlers are $1,650/month, and preschool is $1,450/month. A 5% sibling discount is available.',
  },
  {
    key: 'enrollment_process',
    question: 'How do I enroll my child?',
    answer:
      'Enrollment starts with a tour and application. After acceptance you pay a $250 registration fee and complete health forms. Most families can start within 2-3 weeks.',
  },
  {
    key: 'age_groups',
    question: 'What age groups do you accept?',
    answer:
      'We enroll children ages 6 weeks through 5 years. Our classrooms are divided into Infants (6w-12m), Toddlers (12m-2y), Twos, and Preschool (3-5y).',
  },
  {
    key: 'dropoff_pickup',
    question: 'What are the drop-off and pick-up procedures?',
    answer:
      'Drop-off is between 7:00am and 9:00am. Pick-up must happen by 6:00pm. Authorized adults must sign in/out and show photo ID until staff know them.',
  },
  {
    key: 'meals_snacks',
    question: 'Do you provide meals and snacks?',
    answer:
      'Yes — we provide a USDA-approved breakfast, lunch, and two snacks daily. Menus rotate every four weeks and accommodate most allergies and dietary restrictions.',
  },
  {
    key: 'illness_policy',
    question: 'What is your illness policy?',
    answer:
      'Children must stay home if they have a fever over 100.4°F, vomiting, diarrhea, or a contagious rash, and may return 24 hours after symptoms resolve without medication.',
  },
  {
    key: 'communication_cadence',
    question: 'How will I hear about my child throughout the day?',
    answer:
      'You will get daily photo updates, a meal/nap/diaper log, and teacher notes through the Brightwheel app. Monthly newsletters and quarterly conferences round out communication.',
  },
  {
    key: 'staff_child_ratios',
    question: 'What are your staff-to-child ratios?',
    answer:
      'We maintain ratios of 1:3 for infants, 1:4 for toddlers, 1:6 for twos, and 1:10 for preschoolers — better than state minimums.',
  },
  {
    key: 'outdoor_activity',
    question: 'How much time do children spend outside?',
    answer:
      'Children go outdoors at least twice a day, weather permitting, for a total of 60-90 minutes. We have a fenced playground with age-appropriate equipment.',
  },
  {
    key: 'emergency_procedures',
    question: 'What happens in an emergency?',
    answer:
      'We practice monthly fire and lockdown drills and quarterly severe-weather drills. Parents are notified immediately by push notification and our director coordinates with local emergency services.',
  },
  {
    key: 'waitlist_process',
    question: 'Do you have a waitlist?',
    answer:
      'Yes — most classrooms have a waitlist. A $50 refundable deposit holds your spot. Families are typically offered a space within 3-6 months depending on age group.',
  },
]

const SCHOOL_IDS = [
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  '00000000-0000-0000-0000-000000000007',
  '00000000-0000-0000-0000-000000000008',
  '00000000-0000-0000-0000-000000000009',
]

export class SeedKnowledgeBase1745452804000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const schoolId of SCHOOL_IDS) {
      for (const entry of BASE_ENTRIES) {
        await queryRunner.query(
          `INSERT INTO "knowledge_base_entry"
             ("schoolId", "question", "answer", "isBaseInquiry", "baseInquiryKey", "source", "isActive")
           VALUES ($1, $2, $3, true, $4::"base_inquiry_key_enum", 'manual', true)`,
          [schoolId, entry.question, entry.answer, entry.key],
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const ids = SCHOOL_IDS.map((id) => `'${id}'`).join(', ')
    await queryRunner.query(
      `DELETE FROM "knowledge_base_entry" WHERE "schoolId" IN (${ids}) AND "source" = 'manual'`,
    )
  }
}
