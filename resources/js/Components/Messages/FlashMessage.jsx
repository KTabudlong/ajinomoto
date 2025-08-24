import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';

import { Alert } from '@/Components/Alert';

const FlashedMessages = () => {
  const [visible, setVisible] = useState(true);
  const { flash, errors } = usePage().props;
  const formErrors = Object.keys(errors).length;

  // Determine if the current message is an error
  const isError = !!flash.error || formErrors > 0;

  useEffect(() => {
    setVisible(true);
    // Only auto-dismiss if not an error
    if ((flash.success || flash.info || flash.warning) && !isError) {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
    // Errors stay until closed
  }, [flash, errors]);

  // Responsive and absolute overlay styles
  // Place the flash message 25% from the top for a more precise vertical placement
  const containerStyle =
    'fixed left-1/2 z-50 transform -translate-x-1/2 w-[90%] sm:w-[60%] md:w-[40%] flex flex-col items-center pointer-events-none' +
    '';

  // Inline style for top: 10%
  const containerInlineStyle = { top: '10%' };

  return (
    <div
      className={containerStyle}
      style={{ ...containerInlineStyle, pointerEvents: 'none' }}
    >
      {flash.success && visible && (
        <div className="pointer-events-auto w-full">
          <Alert
            variant="success"
            message={flash.success}
            onClose={() => setVisible(false)}
          />
        </div>
      )}
      {flash.error && visible && (
        <div className="pointer-events-auto w-full">
          <Alert
            variant="error"
            message={flash.error}
            onClose={() => setVisible(false)}
          />
        </div>
      )}
      {formErrors > 0 && visible && (
        <div className="pointer-events-auto w-full">
          <Alert
            variant="error"
            message={'There are ' + formErrors + ' form errors.'}
            onClose={() => setVisible(false)}
          />
        </div>
      )}
    </div>
  );
};

export default FlashedMessages;
