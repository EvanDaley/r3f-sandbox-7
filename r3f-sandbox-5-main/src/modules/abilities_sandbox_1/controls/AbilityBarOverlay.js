import React from "react"
import { useAbilityStore } from "../stores/abilityStore"
import "./Abilities.css"

export default function AbilityBarOverlay() {
  const abilities = useAbilityStore((s) => s.abilities)
  const selectedAbilityId = useAbilityStore((s) => s.selectedAbilityId)
  const selectAbility = useAbilityStore((s) => s.selectAbility)

  return (
    <div className="ability-bar">
      {abilities.map((ability) => {
        const isSelected = ability.id === selectedAbilityId
        const isReady = ability.charge >= 1 // ✅ should be 1, not 0

        return (
          <div
            key={ability.id}
            onClick={() => isReady && selectAbility(ability.id)}
            className={[
              "ability",
              isSelected ? "selected" : "",
              isReady ? "ready" : "cooldown",
            ].join(" ")}
          >
            <div
              className="ability-charge"
              style={{ height: `${ability.charge * 100}%` }}
            />
            <span className="ability-emoji">{ability.emoji}</span>
          </div>
        )
      })}
    </div>
  )
}
