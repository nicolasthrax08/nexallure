import LegalPage from './LegalPage'

export default function PrivacyPage({ t, setPage }) {
  const sections = [
    { title: t.privacy_s1_title, body: t.privacy_s1_body },
    { title: t.privacy_s2_title, body: t.privacy_s2_body },
    {
      title: t.privacy_s3_title,
      body: (
        <>
          {t.privacy_s3_body}
          <br />
          <br />
          {t.privacy_s3_security}
        </>
      ),
    },
    { title: t.privacy_s4_title, body: t.privacy_s4_body },
    { title: t.privacy_s5_title, body: t.privacy_s5_body },
    { title: t.privacy_s6_title, body: t.privacy_s6_body },
    { title: t.privacy_s7_title, body: t.privacy_s7_body },
    { title: t.privacy_s8_title, body: t.privacy_s8_body },
    { title: t.privacy_s9_title, body: t.privacy_s9_body },
  ]

  return (
    <LegalPage
      t={t}
      setPage={setPage}
      title={t.privacy_title}
      updated={t.privacy_updated}
      intro={t.privacy_intro}
      sections={sections}
    />
  )
}
