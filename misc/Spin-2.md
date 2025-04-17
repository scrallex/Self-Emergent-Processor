## **Core Model & Derivations: SEP Spin-2 Coherence Field Cosmology**

### **Field & Action**

- **Field**: The SEP framework introduces a symmetric tensor field $Q_{\mu\nu}(x)$ to represent the coherence and identity structure of the SEP manifold.
  
- **Lagrangian**: We use the Fierz-Pauli action for a massive spin-2 field to ensure a ghost-free formulation:
  
  $  L_{FP} = -\frac{1}{2} \nabla_\lambda Q_{\mu\nu} \nabla^\lambda Q^{\mu\nu} + \nabla_\mu Q^\mu_\lambda \nabla_\nu Q^{\nu\lambda} - \nabla_\mu Q \nabla_\nu Q^{\mu\nu} + \frac{1}{2} \nabla_\lambda Q \nabla^\lambda Q - \frac{1}{2} m^2 (Q_{\mu\nu} Q^{\mu\nu} - Q^2)$
  
  where $Q = Q^\mu_\mu$ is the trace of the field.

---

### **Cosmological Setup**

- **Metric**: We employ the spatially flat FLRW metric:
  
  $  ds^2 = -dt^2 + a(t)^2 \left( dr^2 + r^2 d\Omega^2 \right)$
  
  with $a(t)$ as the scale factor.

- **Field Ansatz (Homogeneous & Isotropic)**: The field is assumed to be homogeneous and isotropic with the ansatz:

  $  Q_{0i} = 0, \quad Q_{ij} = \lambda(t) \delta_{ij}$

---

### **Energy-Momentum Tensor (Tμν)**

- **Energy Density**:

  $  \rho_Q(t) = \frac{3}{2} \frac{\dot{\lambda}^2}{a^2} + \frac{1}{2} m^2 \left( \frac{3\lambda^2}{a^2} - \frac{9\lambda^2}{a^4} \right)$
  
  This describes the kinetic and potential energy densities of the spin-2 field.

- **Pressure**:

  $  p_Q(t) = \frac{3}{2} \frac{\dot{\lambda}^2}{a^2} - \frac{1}{2} m^2 \left( \frac{3\lambda^2}{a^2} - \frac{9\lambda^2}{a^4} \right)$

---

### **Governing Equations**

- **Friedmann Equation (Including Standard Matter/Radiation)**:

  $  3H^2 = 8\pi G \left( \rho_{\text{matter}} + \rho_{\text{radiation}} + \rho_Q(t) \right)$

- **Field Equation** (Klein-Gordon equation for $\lambda(t)$):

  $  \ddot{\lambda} + 3H \dot{\lambda} + m^2 \lambda - \frac{3m^2}{a^2} \lambda = 0$

---

### **Key Observables & Constraints**

- **Equation of State**: The equation of state for the spin-2 field is given by $w(a) = \frac{p_Q}{\rho_Q}$.

- **Fractional Density**: We seek to match $\Omega_Q(a=1) \approx 0.68$, representing the dark energy contribution, and $w(a=1) \approx -1$.

---

### **Tuning Parameters & Initial Conditions**

- **m/H0**: Found to be approximately $5 \times 10^{-6}$ for $w_0 \approx -1$.

- **$\lambda_0$**: Normalized via $\lambda_0 \approx \sqrt{\frac{2 \Omega_\Lambda \rho_\text{crit}}{m^2}}$.

- **$\dot{\lambda}_0$**: Set very small to satisfy the $\Delta N_\text{eff}$ constraint (e.g., $10^{-10}$ to $10^{-15}$).

- **Initial Scale Factor**: $a_0$ is set at $10^{-5}$ for numerical integration.

---

### **Cosmology Simulations**

#### **Perihelion Precession in the Presence of a Massive Spin-2 Field**

![Perihelion Precession](data/Spin-2-PhP.png)

The presence of a massive spin-2 field introduces a slight deviation in the perihelion precession, as shown in the graph above. The cumulative precession curve demonstrates how the additional field modifies orbital mechanics at large scales.

#### **Gravitational Wave Propagation**

![Gravitational Wave Propagation](data/Spin-2-GWP.png)

The amplitude of gravitational waves propagating through spacetime is influenced by the spin-2 field. As the field becomes more pronounced, the amplitude of these waves decays more rapidly, affecting the propagation dynamics compared to standard General Relativity.

#### **Scale Factor Evolution and Spin-2 Field Dynamics**

![Scale Factor and Spin-2 Field](data/Spin-2-FLRW.png)

The evolution of the scale factor $a(t)$ over time in the presence of the spin-2 field exhibits non-standard growth compared to a typical cosmological model. The spin-2 field stabilizes after early perturbations, with $\lambda(t)$ remaining relatively constant as the field transitions to dark energy-like behavior.

---

### **Conclusion**

This model provides a promising framework for understanding cosmological dynamics through the lens of SEP and a massive spin-2 field. The equations derived, coupled with numerical simulations, offer insights into the evolution of the universe, potentially explaining dark energy's role without invoking a cosmological constant.

By adjusting the parameters $m/H_0$, $\lambda_0$, and $\dot{\lambda}_0$, the model can match observed cosmological data, including the CMB, supernovae, and large-scale structure surveys.

For full technical details, consult the [Mathematical Formalism](data/Mathematical_Formalism.md) and the [Thesis Draft](data/Thesis.md).
