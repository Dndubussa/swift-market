import EditProductInteractive from './components/EditProductInteractive';

export const metadata = {
  title: 'Edit Product | Blinno Marketplace',
  description: 'Edit your product on Blinno Marketplace'
};

export default async function EditProductPage({ params }) {
  const { id } = await params;
  
  return <EditProductInteractive productId={id} />;
}

