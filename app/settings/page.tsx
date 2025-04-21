import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function Settings() {
  return (
    <div className='flex items-center gap-2'>
      <h1>Test</h1>
      <h1>Test 2</h1>
      <Input disabled type='text' value={'bsky_dev'} />
    </div>
  );
}
