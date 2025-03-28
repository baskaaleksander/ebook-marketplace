import { parse } from "cookie";

export async function getServerSideProps({ req }: { req: { headers: { cookie?: string } } }) {
  const cookies = parse(req.headers.cookie || "");
  const token = cookies.jwt || null;

  return { props: { token } };
}