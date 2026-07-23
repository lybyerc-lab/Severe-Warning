namespace SevereWeather.Damage
{
    public interface IDamageable
    {
        bool IsDestroyed { get; }
        float HealthNormalized { get; }
        void ApplyDamage(in DamageEvent damageEvent);
    }
}
