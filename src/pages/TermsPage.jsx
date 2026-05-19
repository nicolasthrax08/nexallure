import LegalPage from './LegalPage'

export default function TermsPage({ t, setPage }) {
  const sections = [
    { title: t.terms_s1_title, body: t.terms_s1_body },
    { title: t.terms_s2_title, body: t.terms_s2_body },
    { title: t.terms_s3_title, body: t.terms_s3_body },
    { title: t.terms_s4_title, body: t.terms_s4_body },
    { title: t.terms_s5_title, body: t.terms_s5_body },
    { title: t.terms_s6_title, body: t.terms_s6_body },
    { title: t.terms_s7_title, body: t.terms_s7_body },
    { title: t.terms_s8_title, body: t.terms_s8_body },
  ]

  return (
    <LegalPage
      t={t}
      setPage={setPage}
      title={t.terms_title}
      updated={t.terms_updated}
      intro={t.terms_intro}
      sections={sections}
    />
  )
}
