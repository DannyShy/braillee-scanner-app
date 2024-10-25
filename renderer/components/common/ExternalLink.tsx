type Props = {
  href?: string;
  children?: React.ReactNode;
};

export const ExternalLink = ({ href, children }: Props) => {
  return (
    <a
      onClick={(e) => {
        e.preventDefault();
        window.electronAPI.openExternal(href);
      }}
      href="#"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
};
