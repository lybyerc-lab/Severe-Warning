function identityInstallStyle() {
  if (document.getElementById('presentationIdentityMooBrewStyles')) return;
  const style = document.createElement('style');
  style.id = 'presentationIdentityMooBrewStyles';
  style.textContent = [
    PRESENTATION_IDENTITY_STYLE_PART_1,
    PRESENTATION_IDENTITY_STYLE_PART_2,
    PRESENTATION_IDENTITY_STYLE_PART_3,
  ].join('');
  document.head.appendChild(style);
}
