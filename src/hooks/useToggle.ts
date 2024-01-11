import { useCallback, useState } from 'react';

export const useToggle = (initialValue = false) => {
	const [isEnabled, setIsEnabled] = useState(initialValue);

	const toggle = useCallback(() => setIsEnabled((prev) => !prev), []);

	return [isEnabled, toggle] as [boolean, () => void];
};
