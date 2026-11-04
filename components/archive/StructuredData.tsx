// Data for search engines. `<` is escaped so a name cannot close the tag.
export function StructuredData(props: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(props.data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
