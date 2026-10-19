import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductPage, StudioLayout } from "@/features/studio/studio";
import { products } from "@/features/studio/products";
export const Route = createFileRoute("/_public/products/$slug")({
  loader: ({ params }) => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return product;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.name ?? "Software"} — SkyCanvas Studio` },
      { name: "description", content: loaderData?.description },
    ],
  }),
  notFoundComponent: () => (
    <StudioLayout>
      <main id="main" className="wrap" style={{ paddingBlock: 100 }}>
        <span className="eyebrow">PRODUCT NOT FOUND</span>
        <h1 style={{ marginBlock: 24 }}>A blank canvas.</h1>
        <p style={{ marginBottom: 24 }}>
          We couldn’t find that product in our toolbox.
        </p>
        <a className="button button-dark" href="/#products">
          Explore our software →
        </a>
      </main>
    </StudioLayout>
  ),
  component: () => <ProductPage product={Route.useLoaderData()} />,
});
