clear
clc
close all

%% PARAMETRES
L_drone = 0.17;
alpha   = deg2rad(1);
J       = 2362575.87e-9;
m       = 0.365;
g       = 9.81;
b       = J / L_drone;
c       = (b * sin(alpha)) / m;
w       = logspace(-2, 3, 500);

%% MATRICES LINEARISEES
% theta = 0
theta_e = deg2rad(0);
A0  = [0 0 -g 0; 0 0 -g*tan(theta_e) 0; 0 0 0 1; 0 0 0 0];
B0  = [-sin(theta_e) c*cos(theta_e); cos(theta_e) c*sin(theta_e); 0 0; 0 1];
C0  = [0 0 1 0]; D0 = zeros(1,2);
[num0_uR, den0_uR]   = ss2tf(A0, B0, C0, D0, 2);
G0_uR  = minreal(tf(num0_uR,  den0_uR));

% theta = 10
theta_e = deg2rad(10);
A10 = [0 0 -g 0; 0 0 -g*tan(theta_e) 0; 0 0 0 1; 0 0 0 0];
B10 = [-sin(theta_e) c*cos(theta_e); cos(theta_e) c*sin(theta_e); 0 0; 0 1];
C10 = [0 0 1 0]; D10 = zeros(1,2);
[num10_uR, den10_uR] = ss2tf(A10, B10, C10, D10, 2);
G10_uR = minreal(tf(num10_uR, den10_uR));

% theta = 20
theta_e = deg2rad(20);
A20 = [0 0 -g 0; 0 0 -g*tan(theta_e) 0; 0 0 0 1; 0 0 0 0];
B20 = [-sin(theta_e) c*cos(theta_e); cos(theta_e) c*sin(theta_e); 0 0; 0 1];
C20 = [0 0 1 0]; D20 = zeros(1,2);
[num20_uR, den20_uR] = ss2tf(A20, B20, C20, D20, 2);
G20_uR = minreal(tf(num20_uR, den20_uR));

%% FONCTION SYSTEME NON LINEAIRE CORRIGEE
% X = [vx, vz, theta, theta_dot]
% v1_eq = poussee a l equilibre
% v2_pert = perturbation sinusoidale (couple)
f_nl = @(X, v1_eq, v2_pert) [
    v1_eq*cos(X(3)) - v2_pert*sin(X(3));         % vx_dot
    v1_eq*sin(X(3)) + v2_pert*cos(X(3)) - g;     % vz_dot
    X(4);                                          % theta_dot
    (L_drone/J) * v2_pert                         % theta_ddot
];

%% BODE NON LINEAIRE POUR CHAQUE ANGLE
epsilon    = 0.001;
omega_list = logspace(-2, 2, 30);

gain_dB_all   = zeros(3, length(omega_list));
phase_deg_all = zeros(3, length(omega_list));

angles    = [0, 10, 20];
theta_eqs = deg2rad(angles);

for j = 1:3

    theta_eq = theta_eqs(j);
    v1_eq    = g / cos(theta_eq);

    fprintf('\n=== theta_eq = %d deg  v1_eq = %.4f ===\n', angles(j), v1_eq);

    for k = 1:length(omega_list)

        omega     = omega_list(k);
        T_periode = 2*pi / omega;
        T_sim     = 20 * T_periode;
        dt        = T_periode / 200;
        t_vec     = 0 : dt : T_sim;
        N         = length(t_vec);

        % Signal perturbation v2 (sinus seul)
        v2_sig = epsilon * sin(omega * t_vec);

        % Integration Euler
        X      = zeros(4, N);
        X(:,1) = [0; 0; theta_eq; 0];

        for i = 1:N-1
            dX       = f_nl(X(:,i), v1_eq, v2_sig(i));
            X(:,i+1) = X(:,i) + dt * dX;
        end

        % theta - enleve valeur equilibre
        theta_nl = X(3,:) - theta_eq;

        % Regime permanent - 2 dernieres periodes
        t_debut = T_sim - 2*T_periode;
        idx     = t_vec >= t_debut;

        if sum(idx) < 10
            gain_dB_all(j,k)   = NaN;
            phase_deg_all(j,k) = NaN;
            continue;
        end

        t_reg = t_vec(idx);
        y_reg = theta_nl(idx) - mean(theta_nl(idx));
        u_reg = epsilon * sin(omega * t_reg);

        % Gain
        A_sortie = max(abs(y_reg));
        if A_sortie < 1e-15
            gain_dB_all(j,k) = -300;
        else
            gain_dB_all(j,k) = 20*log10(A_sortie / epsilon);
        end

        % Phase - normalise entre -360 et 0
        [~, idx_u] = max(u_reg);
        [~, idx_y] = max(y_reg);
        delta_t            = t_reg(idx_y) - t_reg(idx_u);
        ph                 = rad2deg(omega * delta_t);
        phase_deg_all(j,k) = mod(ph, -360);

        fprintf('omega=%6.3f -> Gain=%6.1f dB  Phase=%7.1f deg\n', ...
                 omega, gain_dB_all(j,k), phase_deg_all(j,k));
    end
end

%% TRACE COMPARAISON FINALE
[mag0,  ph0]  = bode(G0_uR,  omega_list);
[mag10, ph10] = bode(G10_uR, omega_list);
[mag20, ph20] = bode(G20_uR, omega_list);
mag0  = squeeze(mag0);  ph0  = squeeze(ph0);
mag10 = squeeze(mag10); ph10 = squeeze(ph10);
mag20 = squeeze(mag20); ph20 = squeeze(ph20);

figure;

subplot(2,1,1)
semilogx(omega_list, gain_dB_all(1,:), 'b-o',  'LineWidth', 2, 'MarkerSize', 4)
hold on
semilogx(omega_list, gain_dB_all(2,:), 'r-o',  'LineWidth', 2, 'MarkerSize', 4)
semilogx(omega_list, gain_dB_all(3,:), 'g-o',  'LineWidth', 2, 'MarkerSize', 4)
semilogx(omega_list, 20*log10(mag0),   'b--',  'LineWidth', 1.5)
semilogx(omega_list, 20*log10(mag10),  'r--',  'LineWidth', 1.5)
semilogx(omega_list, 20*log10(mag20),  'g--',  'LineWidth', 1.5)
ylabel('Magnitude (dB)')
title('Question 7 : Non lineaire (cercles) vs Lineaires (tirets)')
legend('NL 0deg','NL 10deg','NL 20deg', ...
       'Lin 0deg','Lin 10deg','Lin 20deg', ...
       'Location', 'southwest')
grid on

subplot(2,1,2)
semilogx(omega_list, phase_deg_all(1,:), 'b-o', 'LineWidth', 2, 'MarkerSize', 4)
hold on
semilogx(omega_list, phase_deg_all(2,:), 'r-o', 'LineWidth', 2, 'MarkerSize', 4)
semilogx(omega_list, phase_deg_all(3,:), 'g-o', 'LineWidth', 2, 'MarkerSize', 4)
semilogx(omega_list, ph0,  'b--', 'LineWidth', 1.5)
semilogx(omega_list, ph10, 'r--', 'LineWidth', 1.5)
semilogx(omega_list, ph20, 'g--', 'LineWidth', 1.5)
ylabel('Phase (deg)')
xlabel('Frequency (rad/s)')
legend('NL 0deg','NL 10deg','NL 20deg', ...
       'Lin 0deg','Lin 10deg','Lin 20deg', ...
       'Location', 'southwest')
grid on
%% QUESTION 8 - Analyse de stabilite
disp('========================================')
disp('QUESTION 8 : Analyse de stabilite')
disp('========================================')

% --- theta = 0 deg ---
disp('--- theta = 0 deg ---')
poles0 = eig(A0);
disp('Valeurs propres :'); disp(poles0.')
if all(real(poles0) < 0)
    disp('STABLE')
elseif any(real(poles0) > 0)
    disp('INSTABLE')
else
    disp('MARGINALEMENT STABLE')
end

% --- theta = 10 deg ---
disp('--- theta = 10 deg ---')
poles10 = eig(A10);
disp('Valeurs propres :'); disp(poles10.')
if all(real(poles10) < 0)
    disp('STABLE')
elseif any(real(poles10) > 0)
    disp('INSTABLE')
else
    disp('MARGINALEMENT STABLE')
end

% --- theta = 20 deg ---
disp('--- theta = 20 deg ---')
poles20 = eig(A20);
disp('Valeurs propres :'); disp(poles20.')
if all(real(poles20) < 0)
    disp('STABLE')
elseif any(real(poles20) > 0)
    disp('INSTABLE')
else
    disp('MARGINALEMENT STABLE')
end

% --- Trace poles dans le plan complexe ---
figure;
hold on

% theta = 0
plot(real(poles0),  imag(poles0),  'bo', 'MarkerSize', 10, 'LineWidth', 2)
% theta = 10
plot(real(poles10), imag(poles10), 'rs', 'MarkerSize', 10, 'LineWidth', 2)
% theta = 20
plot(real(poles20), imag(poles20), 'g^', 'MarkerSize', 10, 'LineWidth', 2)

% Axe imaginaire = frontiere stabilite
xline(0, 'k--', 'LineWidth', 1.5)
yline(0, 'k-',  'LineWidth', 1)

xlabel('Partie reelle')
ylabel('Partie imaginaire')
title('Question 8 : Poles des modeles linearises')
legend('theta=0 deg', 'theta=10 deg', 'theta=20 deg')
grid on
axis([-1 1 -1 1])

%% PARTIE II - QUESTION 7 : Commandabilite
disp('========================================')
disp('PARTIE II - Q7 : Commandabilite')
disp('========================================')

% Matrice de commandabilite
% taille : n x (n*nb_entrees) = 4 x (4*2) = 4x8
Mc0  = [B0   A0*B0   A0^2*B0   A0^3*B0];
Mc10 = [B10  A10*B10 A10^2*B10 A10^3*B10];
Mc20 = [B20  A20*B20 A20^2*B20 A20^3*B20];

rang0  = rank(Mc0);
rang10 = rank(Mc10);
rang20 = rank(Mc20);

disp('--- theta = 0 deg ---')
fprintf('Rang Mc = %d / %d\n', rang0, size(A0,1))
if rang0 == size(A0,1)
    disp('→ COMMANDABLE ✓')
else
    disp('→ NON COMMANDABLE ✗')
end

disp('--- theta = 10 deg ---')
fprintf('Rang Mc = %d / %d\n', rang10, size(A10,1))
if rang10 == size(A10,1)
    disp('→ COMMANDABLE ✓')
else
    disp('→ NON COMMANDABLE ✗')
end

disp('--- theta = 20 deg ---')
fprintf('Rang Mc = %d / %d\n', rang20, size(A20,1))
if rang20 == size(A20,1)
    disp('→ COMMANDABLE ✓')
else
    disp('→ NON COMMANDABLE ✗')
end
%% PARTIE II - QUESTION 8 : Observabilite
disp('========================================')
disp('PARTIE II - Q8 : Observabilite')
disp('========================================')

% -------------------------------------------------------
% TEST 1 : capteur vx seul
% -------------------------------------------------------
disp('TEST 1 : capteur vx seul')
C_vx = [1 0 0 0];
Mo0_vx  = [C_vx; C_vx*A0;  C_vx*A0^2;  C_vx*A0^3];
Mo10_vx = [C_vx; C_vx*A10; C_vx*A10^2; C_vx*A10^3];
Mo20_vx = [C_vx; C_vx*A20; C_vx*A20^2; C_vx*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable\n', rank(Mo0_vx), rank(Mo10_vx), rank(Mo20_vx))

% -------------------------------------------------------
% TEST 2 : capteur vz seul
% -------------------------------------------------------
disp('TEST 2 : capteur vz seul')
C_vz = [0 1 0 0];
Mo0_vz  = [C_vz; C_vz*A0;  C_vz*A0^2;  C_vz*A0^3];
Mo10_vz = [C_vz; C_vz*A10; C_vz*A10^2; C_vz*A10^3];
Mo20_vz = [C_vz; C_vz*A20; C_vz*A20^2; C_vz*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable\n', rank(Mo0_vz), rank(Mo10_vz), rank(Mo20_vz))

% -------------------------------------------------------
% TEST 3 : capteur theta seul
% -------------------------------------------------------
disp('TEST 3 : capteur theta seul')
C_theta = [0 0 1 0];
Mo0_th  = [C_theta; C_theta*A0;  C_theta*A0^2;  C_theta*A0^3];
Mo10_th = [C_theta; C_theta*A10; C_theta*A10^2; C_theta*A10^3];
Mo20_th = [C_theta; C_theta*A20; C_theta*A20^2; C_theta*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable\n', rank(Mo0_th), rank(Mo10_th), rank(Mo20_th))

% -------------------------------------------------------
% TEST 4 : capteur dtheta seul
% -------------------------------------------------------
disp('TEST 4 : capteur dtheta seul')
C_dth = [0 0 0 1];
Mo0_dth  = [C_dth; C_dth*A0;  C_dth*A0^2;  C_dth*A0^3];
Mo10_dth = [C_dth; C_dth*A10; C_dth*A10^2; C_dth*A10^3];
Mo20_dth = [C_dth; C_dth*A20; C_dth*A20^2; C_dth*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable\n', rank(Mo0_dth), rank(Mo10_dth), rank(Mo20_dth))

% -------------------------------------------------------
% TEST 5 : capteur theta + dtheta
% -------------------------------------------------------
disp('TEST 5 : capteur theta + dtheta')
C_ang = [0 0 1 0; 0 0 0 1];
Mo0_ang  = [C_ang; C_ang*A0;  C_ang*A0^2;  C_ang*A0^3];
Mo10_ang = [C_ang; C_ang*A10; C_ang*A10^2; C_ang*A10^3];
Mo20_ang = [C_ang; C_ang*A20; C_ang*A20^2; C_ang*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable\n', rank(Mo0_ang), rank(Mo10_ang), rank(Mo20_ang))

% -------------------------------------------------------
% TEST 6 : capteur vx + vz
% -------------------------------------------------------
disp('TEST 6 : capteur vx + vz')
C_v = [1 0 0 0; 0 1 0 0];
Mo0_v  = [C_v; C_v*A0;  C_v*A0^2;  C_v*A0^3];
Mo10_v = [C_v; C_v*A10; C_v*A10^2; C_v*A10^3];
Mo20_v = [C_v; C_v*A20; C_v*A20^2; C_v*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> OBSERVABLE OUI\n', rank(Mo0_v), rank(Mo10_v), rank(Mo20_v))

% -------------------------------------------------------
% TEST 7 : capteur vx + theta
% -------------------------------------------------------
disp('TEST 7 : capteur vx + theta')
C_vxt = [1 0 0 0; 0 0 1 0];
Mo0_vxt  = [C_vxt; C_vxt*A0;  C_vxt*A0^2;  C_vxt*A0^3];
Mo10_vxt = [C_vxt; C_vxt*A10; C_vxt*A10^2; C_vxt*A10^3];
Mo20_vxt = [C_vxt; C_vxt*A20; C_vxt*A20^2; C_vxt*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable (rang<4 a 0deg)\n', rank(Mo0_vxt), rank(Mo10_vxt), rank(Mo20_vxt))

% -------------------------------------------------------
% TEST 8 : capteur vz + theta
% -------------------------------------------------------
disp('TEST 8 : capteur vz + theta')
C_vzt = [0 1 0 0; 0 0 1 0];
Mo0_vzt  = [C_vzt; C_vzt*A0;  C_vzt*A0^2;  C_vzt*A0^3];
Mo10_vzt = [C_vzt; C_vzt*A10; C_vzt*A10^2; C_vzt*A10^3];
Mo20_vzt = [C_vzt; C_vzt*A20; C_vzt*A20^2; C_vzt*A20^3];
fprintf('rang Mo0=%d  Mo10=%d  Mo20=%d -> NON observable (rang<4 a 0deg)\n', rank(Mo0_vzt), rank(Mo10_vzt), rank(Mo20_vzt))

% -------------------------------------------------------
% RESUME FINAL
% -------------------------------------------------------
disp(' ')
disp('RESUME : TABLEAU OBSERVABILITE')
fprintf('%-25s %6s %6s %6s %15s\n', 'Capteur', '0deg', '10deg', '20deg', 'Observable')
fprintf('%s\n', repmat('-',1,60))
fprintf('%-25s %6d %6d %6d %15s\n', 'vx seul',       rank(Mo0_vx),  rank(Mo10_vx),  rank(Mo20_vx),  'NON')
fprintf('%-25s %6d %6d %6d %15s\n', 'vz seul',       rank(Mo0_vz),  rank(Mo10_vz),  rank(Mo20_vz),  'NON')
fprintf('%-25s %6d %6d %6d %15s\n', 'theta seul',    rank(Mo0_th),  rank(Mo10_th),  rank(Mo20_th),  'NON')
fprintf('%-25s %6d %6d %6d %15s\n', 'dtheta seul',   rank(Mo0_dth), rank(Mo10_dth), rank(Mo20_dth), 'NON')
fprintf('%-25s %6d %6d %6d %15s\n', 'theta+dtheta',  rank(Mo0_ang), rank(Mo10_ang), rank(Mo20_ang), 'NON')
fprintf('%-25s %6d %6d %6d %15s\n', 'vx + vz',       rank(Mo0_v),   rank(Mo10_v),   rank(Mo20_v),   'OUI ✓')
fprintf('%-25s %6d %6d %6d %15s\n', 'vx + theta',    rank(Mo0_vxt), rank(Mo10_vxt), rank(Mo20_vxt), 'NON (0deg)')
fprintf('%-25s %6d %6d %6d %15s\n', 'vz + theta',    rank(Mo0_vzt), rank(Mo10_vzt), rank(Mo20_vzt), 'NON (0deg)')

disp(' ')
disp('CONCLUSION : Seule la mesure (vx + vz) est observable pour tous les angles.')
disp('Il faut donc mesurer vx ET vz simultanement.')
%% PARTIE II - QUESTION 10 : Observateur de Luenberger
disp('========================================')
disp('PARTIE II - Q10 : Observateur')
disp('========================================')

% Matrice de sortie choisie (accéléromètre : vx et vz)
C_obs = [1 0 0 0;
         0 1 0 0];

% Poles en boucle ouverte
poles_BO = eig(A0);
fprintf('Poles boucle ouverte : '); disp(poles_BO.')

% Dynamique la plus lente
% Tous les poles sont en 0, on choisit une base de -1
% Poles observateur 4 fois plus rapides
poles_obs = [-4, -5, -6, -7];
fprintf('Poles observateur imposes : '); disp(poles_obs)

% Calcul du gain L par placement de poles
% On utilise le systeme dual (A', C')
L = place(A0', C_obs', poles_obs)';
disp('Gain L :')
disp(L)

% Matrice de l observateur
A_obs = A0 - L*C_obs;
disp('Matrice A_obs = A - LC :')
disp(A_obs)

% Verification poles de l observateur
poles_verif = eig(A_obs);
disp('Poles de l observateur (verification) :')
disp(poles_verif.')

% Stabilite observateur
if all(real(poles_verif) < 0)
    disp('-> Observateur STABLE ✓')
else
    disp('-> Observateur INSTABLE ✗')
end

% -------------------------------------------------------
% Analyse stabilite autour de theta = 10 et 20 deg
% -------------------------------------------------------
disp('--- Stabilite autour de theta = 10 deg ---')
A_obs10 = A10 - L*C_obs;
poles10_obs = eig(A_obs10);
disp(poles10_obs.')
if all(real(poles10_obs) < 0)
    disp('-> STABLE ✓')
else
    disp('-> INSTABLE ✗')
end

disp('--- Stabilite autour de theta = 20 deg ---')
A_obs20 = A20 - L*C_obs;
poles20_obs = eig(A_obs20);
disp(poles20_obs.')
if all(real(poles20_obs) < 0)
    disp('-> STABLE ✓')
else
    disp('-> INSTABLE ✗')
end

% -------------------------------------------------------
% Trace poles observateur dans le plan complexe
% -------------------------------------------------------
figure;
hold on
plot(real(eig(A_obs)),   imag(eig(A_obs)),   'bo', 'MarkerSize', 10, 'LineWidth', 2)
plot(real(eig(A_obs10)), imag(eig(A_obs10)), 'rs', 'MarkerSize', 10, 'LineWidth', 2)
plot(real(eig(A_obs20)), imag(eig(A_obs20)), 'g^', 'MarkerSize', 10, 'LineWidth', 2)
xline(0, 'k--', 'LineWidth', 1.5)
yline(0, 'k-',  'LineWidth', 1)
xlabel('Partie reelle')
ylabel('Partie imaginaire')
title('Q10 : Poles observateur autour de 0, 10 et 20 deg')
legend('theta=0 deg', 'theta=10 deg', 'theta=20 deg')
grid on
%% PARTIE II - QUESTION 7 : Observateur lineaire sur systeme non lineaire
disp('========================================')
disp('PARTIE II - Q7 : Observateur lineaire')
disp('========================================')

% Parametres simulation
dt     = 0.001;
T_sim  = 10;
t_vec  = 0:dt:T_sim;
N      = length(t_vec);

% Conditions initiales systeme non lineaire
theta_eq = deg2rad(0);
v1_eq    = g / cos(theta_eq);

X_nl    = zeros(4,N);
X_nl(:,1) = [0; 0; theta_eq; 0];  % etat initial = equilibre

% Conditions initiales observateur (erreur initiale)
X_obs    = zeros(4,N);
X_obs(:,1) = [0.1; 0.1; deg2rad(5); 0.1];  % different de l etat reel

% Matrice de sortie
C_obs = [1 0 0 0;
         0 1 0 0];

% Entree : equilibre + petite perturbation
v2_pert = 0.001;

for i = 1:N-1

    % Etat reel non lineaire
    X_i  = X_nl(:,i);
    v2_i = v2_pert * sin(2*t_vec(i));

    dX_nl = f_nl(X_i, v1_eq, v2_i);
    X_nl(:,i+1) = X_i + dt * dX_nl;

    % Sortie mesuree (vx et vz du systeme non lineaire)
    y_mes = C_obs * X_nl(:,i);

    % Sortie estimee
    y_est = C_obs * X_obs(:,i);

    % Observateur lineaire
    dX_obs = A0 * X_obs(:,i) + ...
             B0 * [v1_eq; v2_i] + ...
             L * (y_mes - y_est);

    X_obs(:,i+1) = X_obs(:,i) + dt * dX_obs;

end

% Erreur d estimation
erreur = X_nl - X_obs;

%% Trace des resultats
noms = {'vx (m/s)', 'vz (m/s)', 'theta (rad)', 'dtheta (rad/s)'};

figure;
for k = 1:4
    subplot(4,1,k)
    plot(t_vec, X_nl(k,:),  'b-', 'LineWidth', 1.5)
    hold on
    plot(t_vec, X_obs(k,:), 'r--', 'LineWidth', 1.5)
    ylabel(noms{k})
    legend('Non lineaire', 'Observateur')
    grid on
end
xlabel('Temps (s)')
sgtitle('Q7 : Etat reel vs Etat estime (observateur lineaire)')

figure;
for k = 1:4
    subplot(4,1,k)
    plot(t_vec, erreur(k,:), 'k-', 'LineWidth', 1.5)
    ylabel(['Erreur ' noms{k}])
    grid on
end
xlabel('Temps (s)')
sgtitle('Q7 : Erreur d estimation')

% Analyse performances
fprintf('\nErreur finale (t=%.1fs) :\n', T_sim)
for k = 1:4
    fprintf('  %s : %.6f\n', noms{k}, erreur(k,end))
end

if all(abs(erreur(:,end)) < 1e-3)
    disp('-> Observateur PERFORMANT : erreur convergee vers 0')
else
    disp('-> Erreur residuelle non negligeable')
end
%% PARTIE II - QUESTION 8 : Observateur non lineaire
disp('========================================')
disp('PARTIE II - Q8 : Observateur non lineaire')
disp('========================================')

% Parametres simulation
dt     = 0.001;
T_sim  = 10;
t_vec  = 0:dt:T_sim;
N      = length(t_vec);

% Conditions initiales systeme non lineaire
theta_eq = deg2rad(0);
v1_eq    = g / cos(theta_eq);

% Etat initial systeme reel
X_nl    = zeros(4,N);
X_nl(:,1) = [0; 0; theta_eq; 0];

% Conditions initiales observateur NON LINEAIRE = nulles
X_obs_nl    = zeros(4,N);
X_obs_nl(:,1) = [0; 0; 0; 0];

% Matrice de sortie
C_obs = [1 0 0 0;
         0 1 0 0];

% Perturbation
v2_pert = 0.001;

for i = 1:N-1

    % Etat reel non lineaire
    v2_i = v2_pert * sin(2*t_vec(i));

    dX_nl = f_nl(X_nl(:,i), v1_eq, v2_i);
    X_nl(:,i+1) = X_nl(:,i) + dt * dX_nl;

    % Sortie mesuree (systeme reel)
    y_mes = C_obs * X_nl(:,i);

    % Sortie estimee (observateur non lineaire)
    y_est = C_obs * X_obs_nl(:,i);

    % Observateur NON LINEAIRE
    % Modele non lineaire + correction L*(y_mes - y_est)
    dX_obs_nl = f_nl(X_obs_nl(:,i), v1_eq, v2_i) + ...
                L * (y_mes - y_est);

    X_obs_nl(:,i+1) = X_obs_nl(:,i) + dt * dX_obs_nl;

end

% Erreur d estimation
erreur_nl = X_nl - X_obs_nl;

%% Trace comparaison Q7 vs Q8
noms = {'vx (m/s)', 'vz (m/s)', 'theta (rad)', 'dtheta (rad/s)'};

figure;
for k = 1:4
    subplot(4,1,k)
    plot(t_vec, X_nl(k,:),     'b-',  'LineWidth', 1.5)
    hold on
    plot(t_vec, X_obs(k,:),    'r--', 'LineWidth', 1.5)
    plot(t_vec, X_obs_nl(k,:), 'g-',  'LineWidth', 1.5)
    ylabel(noms{k})
    legend('Non lineaire', 'Obs lineaire', 'Obs non lineaire')
    grid on
end
xlabel('Temps (s)')
sgtitle('Q8 : Comparaison observateur lineaire vs non lineaire')

figure;
for k = 1:4
    subplot(4,1,k)
    plot(t_vec, erreur(k,:),    'r--', 'LineWidth', 1.5)
    hold on
    plot(t_vec, erreur_nl(k,:), 'g-',  'LineWidth', 1.5)
    ylabel(['Erreur ' noms{k}])
    legend('Obs lineaire', 'Obs non lineaire')
    grid on
end
xlabel('Temps (s)')
sgtitle('Q8 : Comparaison erreurs estimation')

% Analyse performances
fprintf('\nErreur finale observateur NON LINEAIRE (t=%.1fs) :\n', T_sim)
for k = 1:4
    fprintf('  %s : %.6f\n', noms{k}, erreur_nl(k,end))
end

fprintf('\nErreur finale observateur LINEAIRE (t=%.1fs) :\n', T_sim)
for k = 1:4
    fprintf('  %s : %.6f\n', noms{k}, erreur(k,end))
end

if all(abs(erreur_nl(:,end)) < abs(erreur(:,end)))
    disp('-> Observateur NON LINEAIRE plus performant ✓')
else
    disp('-> Performances similaires')
end
%% PARTIE III - QUESTION 9 : Retour d'etat
disp('========================================')
disp('PARTIE III - Q9 : Retour d etat')
disp('========================================')

% Verification commandabilite avec B0 complet
Mc0 = [B0 A0*B0 A0^2*B0 A0^3*B0];
fprintf('Rang commandabilite B0 complet : %d\n', rank(Mc0))

% Poles boucle fermee imposes
poles_BF = [-1, -2, -3, -3.5];
fprintf('Poles BF imposes : '); disp(poles_BF)

% Calcul gain K avec les 2 entrees
% K sera de taille 2x4
% On utilise la fonction place avec B0 complet
% Astuce : on utilise lqr pour eviter les problemes numeriques
Q = diag([1, 1, 100, 10]);  % penalise theta fortement
R = diag([1, 1]);            % penalise les 2 entrees

K = lqr(A0, B0, Q, R);
fprintf('Gain K (LQR) :\n'); disp(K)

% Matrice boucle fermee
A_BF = A0 - B0 * K;
poles_BF_verif = eig(A_BF);
fprintf('Poles BF obtenus : '); disp(poles_BF_verif.')

if all(real(poles_BF_verif) < 0)
    disp('-> Boucle fermee STABLE a theta=0 ✓')
else
    disp('-> INSTABLE ✗')
end

% -------------------------------------------------------
% Analyse stabilite autour de theta = 10 deg
% -------------------------------------------------------
disp('--- Stabilite BF autour de theta = 10 deg ---')
A_BF10 = A10 - B10 * K;
poles_BF10 = eig(A_BF10);
fprintf('Poles BF : '); disp(poles_BF10.')
if all(real(poles_BF10) < 0)
    disp('-> STABLE ✓')
else
    disp('-> INSTABLE ✗')
end

% -------------------------------------------------------
% Analyse stabilite autour de theta = 20 deg
% -------------------------------------------------------
disp('--- Stabilite BF autour de theta = 20 deg ---')
A_BF20 = A20 - B20 * K;
poles_BF20 = eig(A_BF20);
fprintf('Poles BF : '); disp(poles_BF20.')
if all(real(poles_BF20) < 0)
    disp('-> STABLE ✓')
else
    disp('-> INSTABLE ✗')
end

% -------------------------------------------------------
% Simulation retour d etat sur systeme non lineaire
% -------------------------------------------------------
dt    = 0.001;
T_sim = 10;
t_vec = 0:dt:T_sim;
N     = length(t_vec);

theta_eq  = deg2rad(0);
v1_eq     = g / cos(theta_eq);

X         = zeros(4,N);
X(:,1)    = [0; 0; deg2rad(10); 0];

U_hist    = zeros(2,N);

for i = 1:N-1
    % Retour d etat complet
    u = -K * X(:,i);

    % Ajout equilibre sur v1
    u(1) = u(1) + v1_eq;

    % Saturation
    u = max(min(u, 10), -10);

    U_hist(:,i) = u;

    dX = f_nl(X(:,i), u(1), u(2));
    X(:,i+1) = X(:,i) + dt * dX;
end

% -------------------------------------------------------
% Trace
% -------------------------------------------------------
figure;
subplot(3,1,1)
plot(t_vec, rad2deg(X(3,:)), 'b-', 'LineWidth', 2)
yline(0, 'r--', 'LineWidth', 1.5)
ylabel('theta (deg)')
title('Q9 : Retour d etat - Stabilisation de theta')
legend('theta', 'reference = 0')
grid on

subplot(3,1,2)
plot(t_vec, X(1,:), 'b-', t_vec, X(2,:), 'r-', 'LineWidth', 1.5)
ylabel('Vitesses (m/s)')
legend('vx', 'vz')
grid on

subplot(3,1,3)
plot(t_vec, U_hist(1,:), 'b-', t_vec, U_hist(2,:), 'r-', 'LineWidth', 1.5)
ylabel('Commandes')
xlabel('Temps (s)')
legend('v1', 'v2')
grid on

% -------------------------------------------------------
% Trace poles
% -------------------------------------------------------
figure;
hold on
plot(real(eig(A_BF)),   imag(eig(A_BF)),   'bo', 'MarkerSize',10,'LineWidth',2)
plot(real(eig(A_BF10)), imag(eig(A_BF10)), 'rs', 'MarkerSize',10,'LineWidth',2)
plot(real(eig(A_BF20)), imag(eig(A_BF20)), 'g^', 'MarkerSize',10,'LineWidth',2)
xline(0,'k--','LineWidth',1.5)
yline(0,'k-','LineWidth',1)
xlabel('Partie reelle')
ylabel('Partie imaginaire')
title('Q9 : Poles BF autour de 0, 10 et 20 deg')
legend('theta=0 deg','theta=10 deg','theta=20 deg')
grid on
%% PARTIE III - QUESTION 10 : Sans erreur statique
disp('========================================')
disp('PARTIE III - Q10 : Sans erreur statique')
disp('========================================')

% Gain integrateur
Ki = 500;

% -------------------------------------------------------
% Simulation
% -------------------------------------------------------
dt      = 0.001;
T_sim   = 30;
t_vec   = 0:dt:T_sim;
N       = length(t_vec);

theta_eq  = deg2rad(0);
v1_eq     = g / cos(theta_eq);
theta_ref = deg2rad(0);

X         = zeros(4,N);
X(:,1)    = [0; 0; deg2rad(10); 0];

integrale = 0;
U_hist    = zeros(2,N);

for i = 1:N-1

    % Erreur theta
    erreur_theta = theta_ref - X(3,i);

    % Integration erreur
    integrale = integrale + dt * erreur_theta;

    % Loi de commande = retour etat Q9 + integrateur
    u    = -K * X(:,i);
    u(2) = u(2) + Ki * integrale;

    % Ajout equilibre v1
    u(1) = u(1) + v1_eq;

    % Saturation
    u = max(min(u, 10), -10);

    U_hist(:,i) = u;

    dX       = f_nl(X(:,i), u(1), u(2));
    X(:,i+1) = X(:,i) + dt * dX;
end

% -------------------------------------------------------
% Trace
% -------------------------------------------------------
figure;
subplot(3,1,1)
plot(t_vec, rad2deg(X(3,:)), 'b-', 'LineWidth', 2)
yline(0, 'r--', 'LineWidth', 1.5)
ylabel('theta (deg)')
title('Q10 : Retour d etat + integrateur')
legend('theta', 'reference = 0')
grid on

subplot(3,1,2)
plot(t_vec, X(1,:), 'b-', t_vec, X(2,:), 'r-', 'LineWidth', 1.5)
ylabel('Vitesses (m/s)')
legend('vx', 'vz')
grid on

subplot(3,1,3)
plot(t_vec, U_hist(1,:), 'b-', t_vec, U_hist(2,:), 'r-', 'LineWidth', 1.5)
ylabel('Commandes')
xlabel('Temps (s)')
legend('v1', 'v2')
grid on

% -------------------------------------------------------
% Erreur statique
% -------------------------------------------------------
erreur_finale = rad2deg(X(3,end)) - rad2deg(theta_ref);
fprintf('\nErreur statique finale : %.6f deg\n', erreur_finale)
if abs(erreur_finale) < 0.01
    disp('-> Erreur statique NULLE ✓')
else
    disp('-> Erreur statique non nulle ✗')
    fprintf('-> Ki actuel = %d\n', Ki)
end